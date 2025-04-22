// Function definitions - placed outside event listener
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
        'zh': 'Chinese',
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

// Function to load vocabulary from localStorage
function loadVocabulary() {
    const vocabulary = JSON.parse(localStorage.getItem('vocabulary') || '[]');
    const vocabularyList = document.getElementById('vocabulary-list');
    
    if (!vocabularyList) return;
    
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
    
    if (!notesList) return;
    
    notesList.innerHTML = '';
    
    if (notes.length === 0) {
        notesList.innerHTML = '<p>No notes yet. Create one above!</p>';
        return;
    }
    
    // Sort notes by date (newest first)
    notes.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    
    notes.forEach((note, index) => {
        // Ensure each note has a unique ID
        if (!note.id) note.id = Date.now() + '-' + index;
        
        const noteElement = document.createElement('div');
        noteElement.className = 'note-item';
        noteElement.dataset.id = note.id;
        noteElement.innerHTML = `
            <div class="note-header">
                <h3>${note.title}</h3>
                <button class="delete-btn" data-id="${note.id}">Delete</button>
            </div>
            <p>${note.content.replace(/\n/g, '<br>')}</p>
            <div class="note-date">${formatDate(note.date)}</div>
        `;
        notesList.appendChild(noteElement);
    });
    
    // Update localStorage with any added IDs
    localStorage.setItem('notes', JSON.stringify(notes));
    
    // Add event listeners to delete buttons using data-id attribute
    document.querySelectorAll('.note-item .delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            deleteNote(id);
        });
    });
}

// Function to delete note by ID instead of index
function deleteNote(id) {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const updatedNotes = notes.filter(note => note.id !== id);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
    loadNotes();
}

// Function to save note with a unique ID
function saveNote() {
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();
    
    if (!title || !content) {
        alert('Please enter both title and content for your note');
        return;
    }
    
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    notes.push({ 
        id: 'note-' + Date.now(), 
        title, 
        content, 
        date: new Date().toISOString() 
    });
    localStorage.setItem('notes', JSON.stringify(notes));
    
    // Clear form
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
    
    // Reload notes
    loadNotes();
}

// Function to load tasks
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const tasksList = document.getElementById('tasks-list');
    
    if (!tasksList) return;
    
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
    
    sortedTasks.forEach((task) => {
        // Ensure each task has a unique ID
        if (!task.id) task.id = 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.dataset.id = task.id;
        taskElement.innerHTML = `
            <div class="task-content">
                <input type="checkbox" id="${task.id}" ${task.completed ? 'checked' : ''}>
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
            </div>
            <div class="task-controls">
                <button class="delete-btn" data-id="${task.id}">Delete</button>
            </div>
        `;
        tasksList.appendChild(taskElement);
    });
    
    // Update localStorage with any added IDs
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Add event listeners to checkboxes and delete buttons
    document.querySelectorAll('#tasks-list input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const id = this.id;
            toggleTaskCompletion(id);
        });
    });
    
    document.querySelectorAll('#tasks-list .delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            deleteTask(id);
        });
    });
}

// Function to toggle task completion by ID
function toggleTaskCompletion(id) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        loadTasks();
    }
}

// Function to delete task by ID
function deleteTask(id) {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const updatedTasks = tasks.filter(task => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    loadTasks();
}

// Function to add task with a unique ID
function addTask() {
    const taskText = document.getElementById('task-input').value.trim();
    
    if (!taskText) {
        alert('Please enter a task');
        return;
    }
    
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks.push({ 
        id: 'task-' + Date.now(), 
        text: taskText, 
        completed: false, 
        date: new Date().toISOString() 
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Clear input
    document.getElementById('task-input').value = '';
    
    // Reload tasks
    loadTasks();
}

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

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
                // Display the translated text directly from the response
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
    
    // Attach event listener for the save translation button
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
    
    // Copy Subtitles to Clipboard Only
    const copyButton = document.getElementById('copy-subtitles');

    if (copyButton) {
        copyButton.addEventListener('click', async function() {
            // Find the subtitle content
            const subtitleElement = document.querySelector('.subtitle-content p');
            
            if (subtitleElement) {
                const subtitleText = subtitleElement.textContent;
                
                // Save original button text
                const originalButtonText = this.textContent;
                
                // Change button text to show loading state
                this.textContent = 'Copying...';
                this.disabled = true;
                
                try {
                    // Use the Clipboard API to copy text
                    await navigator.clipboard.writeText(subtitleText);
                    
                    // Show success message
                    this.textContent = 'Copied!';
                    this.classList.add('copied');
                } catch (err) {
                    console.error('Clipboard API failed:', err);
                    
                    // Fallback for clipboard
                    try {
                        // Create temporary textarea for clipboard
                        const textarea = document.createElement('textarea');
                        textarea.value = subtitleText;
                        textarea.style.position = 'fixed';  // Prevent scrolling to bottom
                        document.body.appendChild(textarea);
                        textarea.select();
                        
                        // Execute copy command
                        const successful = document.execCommand('copy');
                        document.body.removeChild(textarea);
                        
                        if (successful) {
                            // Show success message
                            this.textContent = 'Copied!';
                            this.classList.add('copied');
                        } else {
                            // Show failure message
                            this.textContent = 'Failed!';
                            this.classList.add('copy-failed');
                        }
                    } catch (fallbackErr) {
                        console.error('All copy methods failed:', fallbackErr);
                        this.textContent = 'Failed!';
                        this.classList.add('copy-failed');
                    }
                } finally {
                    // Reset button after a delay
                    setTimeout(() => {
                        this.textContent = originalButtonText;
                        this.disabled = false;
                        this.classList.remove('copied');
                        this.classList.remove('copy-failed');
                    }, 2000);
                }
            }
        });
    }

    // Check for Create Note from Subtitles button
    const createNoteBtn = document.getElementById('create-note-from-subtitles');
    if (createNoteBtn) {
        createNoteBtn.addEventListener('click', async function() {
            if (document.querySelector('.subtitle-content p')) {
                const subtitleText = document.querySelector('.subtitle-content p').textContent;
                const videoUrl = document.getElementById('video_url').value;
                
                // Show loading state
                const originalBtnText = this.textContent;
                this.textContent = 'Creating...';
                this.disabled = true;
                
                try {
                    // Fixed template literals with backticks
                    const response = await fetch(`/get_video_title/?video_url=${encodeURIComponent(videoUrl)}`);
                    const data = await response.json();
                    
                    let noteTitle = 'Notes';
                    
                    if (response.ok && data.title) {
                        // Fixed template literals with backticks
                        noteTitle = `Notes: ${data.title}`;
                    } else {
                        // Fallback to video ID if title fetch fails
                        const videoId = videoUrl.includes('v=') ? 
                            videoUrl.split('v=')[1].split('&')[0] : 
                            'YouTube Video';
                        // Fixed template literals with backticks
                        noteTitle = `Notes for video: ${videoId}`;
                    }
                    
                    document.getElementById('note-title').value = noteTitle;
                    document.getElementById('note-content').value = subtitleText;
                    
                    // Switch to notes tab and scroll there
                    document.querySelector('.tab[data-tab="notes"]').click();
                    document.getElementById('note-title').scrollIntoView({ behavior: 'smooth' });
                } catch (error) {
                    console.error('Error fetching video title:', error);
                    // Fallback if title fetch fails
                    const videoId = videoUrl.includes('v=') ? 
                        videoUrl.split('v=')[1].split('&')[0] : 
                        'YouTube Video';
                    // Fixed template literals with backticks
                    document.getElementById('note-title').value = `Notes for video: ${videoId}`;
                    document.getElementById('note-content').value = subtitleText;
                } finally {
                    // Restore button state
                    this.textContent = originalBtnText;
                    this.disabled = false;
                }
            }
        });
    }
    
    // Video URL form - show loading state and perform validation
    const videoUrlForm = document.getElementById('video-url-form');
    if (videoUrlForm) {
        videoUrlForm.addEventListener('submit', function(e) {
            const videoUrl = document.getElementById('video_url').value.trim();
            if (!videoUrl) {
                e.preventDefault();
                alert('Please enter a YouTube URL');
                return;
            }
            
            // Show loading state
            const submitBtn = document.getElementById('check-subtitles-btn');
            if (submitBtn) {
                submitBtn.textContent = 'Checking...';
                submitBtn.disabled = true;
            }
            
            // Form will be submitted normally
        });
    }

    // Language selection form - show loading state
    const languageForm = document.getElementById('language-selection-form');
    if (languageForm) {
        languageForm.addEventListener('submit', function() {
            const submitBtn = document.getElementById('extract-subtitles-btn');
            if (submitBtn) {
                submitBtn.textContent = 'Extracting...';
                submitBtn.disabled = true;
            }
        });
    }
    
    // Add keyboard shortcut for translation (Ctrl+Enter)
    const textToTranslate = document.getElementById('english-text');
    if (textToTranslate) {
        textToTranslate.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('translate-btn').click();
            }
        });
    }
    
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
    
    // Download form handling with better download detection
    const downloadForm = document.getElementById('download-form');
    if (downloadForm) {
        const downloadButton = downloadForm.querySelector('button');
        if (downloadButton) {
            const originalButtonText = downloadButton.textContent;
            
            downloadForm.addEventListener('submit', function(event) {
                event.preventDefault(); // Prevent normal form submission
                
                // Change button text to "Downloading..."
                downloadButton.textContent = 'Downloading...';
                downloadButton.disabled = true;
                downloadButton.classList.add('downloading');
                
                // Create form data from the form
                const formData = new FormData(downloadForm);
                
                // Generate a unique download ID
                const downloadId = Date.now().toString();
                
                // Make an AJAX request
                fetch(downloadForm.action, {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Download failed');
                    }
                    return response.blob();
                })
                .then(blob => {
                    // Create a URL for the blob
                    const url = window.URL.createObjectURL(blob);
                    
                    // Create a temporary link and trigger download
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = 'subtitles.srt'; // Default filename or get from headers
                    
                    // Add download attribute with the unique ID
                    a.setAttribute('download', downloadId);
                    
                    // Append to document and click
                    document.body.appendChild(a);
                    
                    // Create a MutationObserver to detect when the download is added
                    const observer = new MutationObserver((mutations, obs) => {
                        // Look for the download item
                        const downloadItem = document.querySelector(`[download="${downloadId}"]`);
                        if (downloadItem) {
                            // Download has started
                            downloadButton.textContent = 'Downloaded!';
                            downloadButton.classList.remove('downloading');
                            downloadButton.classList.add('downloaded');
                            
                            // Reset button after 2 seconds
                            setTimeout(() => {
                                downloadButton.textContent = originalButtonText;
                                downloadButton.disabled = false;
                                downloadButton.classList.remove('downloading');
                                downloadButton.classList.remove('downloaded');
                            }, 2000);
                            
                            // Disconnect the observer
                            obs.disconnect();
                        }
                    });
                    
                    // Start observing
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true,
                        attributes: true,
                        attributeFilter: ['download']
                    });
                    
                    // Click to start download
                    a.click();
                    
                    // Clean up
                    window.URL.revokeObjectURL(url);
                    
                    // Set a fallback timeout in case the observer doesn't detect the download
                    setTimeout(() => {
                        observer.disconnect();
                        if (downloadButton.textContent === 'Downloading...') {
                            downloadButton.textContent = 'Downloaded!';
                            downloadButton.classList.remove('downloading');
                            downloadButton.classList.add('downloaded');
                            
                            setTimeout(() => {
                                downloadButton.textContent = originalButtonText;
                                downloadButton.disabled = false;
                                downloadButton.classList.remove('downloading');
                                downloadButton.classList.remove('downloaded');
                            }, 2000);
                        }
                    }, 3000);
                })
                .catch(error => {
                    console.error('Download error:', error);
                    
                    // Show error message
                    downloadButton.textContent = 'Download Failed';
                    downloadButton.classList.remove('downloading');
                    downloadButton.classList.add('download-failed');
                    
                    // Reset button after 2 seconds
                    setTimeout(() => {
                        downloadButton.textContent = originalButtonText;
                        downloadButton.disabled = false;
                        downloadButton.classList.remove('downloading');
                        downloadButton.classList.remove('download-failed');
                    }, 2000);
                });
            });
        }
    }

    // Connect event listeners for notes and tasks
    const saveNoteBtn = document.getElementById('save-note-btn');
    if (saveNoteBtn) {
        saveNoteBtn.addEventListener('click', saveNote);
    }
    
    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', addTask);
    }
    
    // Add enter key support for tasks
    const taskInput = document.getElementById('task-input');
    if (taskInput) {
        taskInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTask();
            }
        });
    }
});