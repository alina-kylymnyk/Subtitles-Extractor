// Wait for DOM to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    loadVocabulary();
    loadNotes();
    loadTasks();
    
    // Attach event listener for the translator form
    document.getElementById('translator-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const inputLanguage = document.getElementById('input-language').value;
        const targetLanguage = document.getElementById('target-language').value;
        const text = document.getElementById('english-text').value.trim();
        
        if (!text) {
            alert('Please enter some text to translate');
            return;
        }
        
        // Show loading indicator
        const translateBtn = document.getElementById('translate-btn');
        const originalBtnText = translateBtn.textContent;
        translateBtn.textContent = 'Translating...';
        translateBtn.disabled = true;
        
        try {
            const response = await fetch('/translate/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    text: text, 
                    source_lang: inputLanguage, 
                    target_lang: targetLanguage 
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                document.getElementById('translated-text').textContent = data.translated;
                document.getElementById('translation-result').style.display = 'block';
            } else {
                alert('Error: ' + (data.detail || 'Translation failed'));
                console.error('Translation error details:', data);
            }
        } catch (error) {
            alert('Error connecting to the server');
            console.error('Connection error:', error);
        } finally {
            // Restore button state
            translateBtn.textContent = originalBtnText;
            translateBtn.disabled = false;
        }
    });

    // Attach event listener for the save button
    document.getElementById('save-btn').addEventListener('click', function() {
        const originalText = document.getElementById('english-text').value.trim();
        const translatedText = document.getElementById('translated-text').textContent.trim();
        
        if (!originalText || !translatedText) {
            alert('Both source and translated texts are required');
            return;
        }
        
        // Get existing vocabulary from localStorage
        const vocabulary = JSON.parse(localStorage.getItem('vocabulary') || '[]');
        
        // Check if the phrase already exists to avoid duplicates
        const exists = vocabulary.some(phrase => 
            phrase.original === originalText && phrase.translated === translatedText
        );
        
        if (exists) {
            alert('This phrase is already in your vocabulary');
            return;
        }
        
        // Add new phrase
        vocabulary.push({
            id: Date.now(), // Use timestamp as unique ID
            original: originalText,
            translated: translatedText,
            sourceLang: document.getElementById('input-language').value,
            targetLang: document.getElementById('target-language').value,
            date: new Date().toISOString()
        });
        
        // Save back to localStorage
        localStorage.setItem('vocabulary', JSON.stringify(vocabulary));
        
        // Show success message
        const saveBtn = document.getElementById('save-btn');
        const originalBtnText = saveBtn.textContent;
        saveBtn.textContent = 'Saved!';
        saveBtn.classList.add('btn-saved');
        
        setTimeout(() => {
            saveBtn.textContent = originalBtnText;
            saveBtn.classList.remove('btn-saved');
        }, 2000);
        
        loadVocabulary();
    });

    // Attach event listener for the refresh vocabulary button
    document.getElementById('refresh-vocabulary').addEventListener('click', function() {
        loadVocabulary();
        
        // Show visual feedback
        const refreshBtn = this;
        refreshBtn.textContent = 'Refreshed!';
        refreshBtn.classList.add('btn-saved');
        
        setTimeout(() => {
            refreshBtn.textContent = 'Refresh Vocabulary';
            refreshBtn.classList.remove('btn-saved');
        }, 1500);
    });
    
    // Add keyboard shortcut for translation (Ctrl+Enter)
    document.getElementById('english-text').addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('translate-btn').click();
        }
    });
    
    // Attach tab functionality
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            document.getElementById(this.dataset.tab + '-tab').classList.add('active');
        });
    });
    
    // Notes functionality
    document.getElementById('save-note-btn').addEventListener('click', function() {
        const title = document.getElementById('note-title').value.trim();
        const content = document.getElementById('note-content').value.trim();
        
        if (!title || !content) {
            alert('Please enter both title and content for your note');
            return;
        }
        
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        notes.push({ title, content, date: new Date().toISOString() });
        localStorage.setItem('notes', JSON.stringify(notes));
        
        // Clear form
        document.getElementById('note-title').value = '';
        document.getElementById('note-content').value = '';
        
        // Reload notes
        loadNotes();
    });
    
    // Tasks functionality
    document.getElementById('add-task-btn').addEventListener('click', function() {
        const taskText = document.getElementById('task-input').value.trim();
        
        if (!taskText) {
            alert('Please enter a task');
            return;
        }
        
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        tasks.push({ text: taskText, completed: false, date: new Date().toISOString() });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Clear input
        document.getElementById('task-input').value = '';
        
        // Reload tasks
        loadTasks();
    });
});

// Function to load vocabulary from localStorage
function loadVocabulary() {
    const vocabulary = JSON.parse(localStorage.getItem('vocabulary') || '[]');
    const vocabularyList = document.getElementById('vocabulary-list');
    vocabularyList.innerHTML = '';
    
    if (vocabulary.length === 0) {
        vocabularyList.innerHTML = '<p>No saved phrases yet.</p>';
        return;
    }
    
    // Sort vocabulary by date (newest first)
    vocabulary.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    
    vocabulary.forEach(phrase => {
        const item = document.createElement('div');
        item.className = 'vocabulary-item';
        
        // Get language names for display
        const sourceLang = getLanguageName(phrase.sourceLang || 'unknown');
        const targetLang = getLanguageName(phrase.targetLang || 'unknown');
        
        item.innerHTML = `
            <div class="vocab-header">
                <span class="lang-label">${sourceLang} → ${targetLang}</span>
                <button class="delete-btn" data-id="${phrase.id}">Delete</button>
            </div>
            <strong>Original:</strong> ${phrase.original}<br>
            <strong>Translated:</strong> ${phrase.translated}
        `;
        vocabularyList.appendChild(item);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.vocabulary-item .delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            deleteVocabularyItem(id);
        });
    });
}

// Function to get language name from code
function getLanguageName(code) {
    const languages = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ja': 'Japanese',
        'zh-cn': 'Chinese',
        'ar': 'Arabic',
        'hi': 'Hindi',
        'ko': 'Korean',
        'nl': 'Dutch',
        'pl': 'Polish',
        'sv': 'Swedish',
        'tr': 'Turkish',
        'uk': 'Ukrainian',
        'vi': 'Vietnamese',
        'unknown': 'Unknown'
    };
    
    return languages[code] || code;
}

// Function to delete vocabulary item
function deleteVocabularyItem(id) {
    const vocabulary = JSON.parse(localStorage.getItem('vocabulary') || '[]');
    const updatedVocabulary = vocabulary.filter(item => item.id !== id);
    localStorage.setItem('vocabulary', JSON.stringify(updatedVocabulary));
    loadVocabulary();
}

// Function to load notes
function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const notesList = document.getElementById('notes-list');
    notesList.innerHTML = '';
    
    if (notes.length === 0) {
        notesList.innerHTML = '<p>No notes yet. Create one above!</p>';
        return;
    }
    
    // Sort notes by date (newest first)
    notes.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    
    notes.forEach((note, index) => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-item';
        noteElement.innerHTML = `
            <div class="note-header">
                <h3>${note.title}</h3>
                <button class="delete-btn" data-index="${index}">Delete</button>
            </div>
            <p>${note.content.replace(/\n/g, '<br>')}</p>
            <div class="note-date">${formatDate(note.date)}</div>
        `;
        notesList.appendChild(noteElement);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.note-item .delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            deleteNote(index);
        });
    });
}

function deleteNote(index) {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    notes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    loadNotes();
}

// Function to load tasks
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const tasksList = document.getElementById('tasks-list');
    tasksList.innerHTML = '';
    
    if (tasks.length === 0) {
        tasksList.innerHTML = '<p>No tasks yet. Add one above!</p>';
        return;
    }
    
    // First show incomplete tasks, then completed ones
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.completed === b.completed) {
            // If completion status is the same, sort by date (newest first)
            return new Date(b.date || 0) - new Date(a.date || 0);
        }
        // Otherwise, incomplete tasks first
        return a.completed ? 1 : -1;
    });
    
    sortedTasks.forEach((task, index) => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.innerHTML = `
            <div class="task-content">
                <input type="checkbox" id="task-${index}" ${task.completed ? 'checked' : ''}>
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
            </div>
            <div class="task-controls">
                <button class="delete-btn" data-index="${index}">Delete</button>
            </div>
        `;
        tasksList.appendChild(taskElement);
    });
    
    // Add event listeners to checkboxes and delete buttons
    document.querySelectorAll('#tasks-list input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const index = parseInt(this.id.split('-')[1]);
            toggleTaskCompletion(index);
        });
    });
    
    document.querySelectorAll('#tasks-list .delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            deleteTask(index);
        });
    });
}

function toggleTaskCompletion(index) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
}

function deleteTask(index) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
}

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}