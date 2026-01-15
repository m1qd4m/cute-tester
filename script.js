// Simple, reliable background music player
class SimpleMusicPlayer {
    constructor() {
        this.audio = document.getElementById('background-music');
        this.isPlaying = false;
        this.hasStarted = false;
        
        if (!this.audio) {
            console.error("Audio element not found!");
            return;
        }
        
        // Set volume to 30%
        this.audio.volume = 0.3;
        
        // Preload the audio
        this.audio.preload = 'auto';
        
        // Mark when audio can play
        this.audio.addEventListener('canplaythrough', () => {
            console.log("Audio is ready to play");
            this.tryToPlay();
        });
        
        // Handle errors
        this.audio.addEventListener('error', (e) => {
            console.error("Audio error:", e);
            console.error("Audio error details:", this.audio.error);
        });
        
        // Start playing when page loads
        window.addEventListener('load', () => {
            setTimeout(() => this.tryToPlay(), 100);
        });
        
        // Play on any user interaction
        this.setupInteractionListeners();
        
        // Save state before leaving page
        window.addEventListener('beforeunload', () => {
            if (this.isPlaying) {
                localStorage.setItem('musicIsPlaying', 'true');
                localStorage.setItem('musicTime', this.audio.currentTime);
            }
        });
        
        // Restore state if coming from another page
        this.restoreState();
    }
    
    restoreState() {
        // Check if music was playing on previous page
        const wasPlaying = localStorage.getItem('musicIsPlaying') === 'true';
        const savedTime = localStorage.getItem('musicTime');
        
        if (wasPlaying && savedTime) {
            this.audio.currentTime = parseFloat(savedTime);
            this.isPlaying = true;
            this.hasStarted = true;
        }
    }
    
    setupInteractionListeners() {
        const events = ['click', 'touchstart', 'keydown', 'mousedown'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                if (!this.hasStarted && this.audio.readyState >= 2) {
                    this.play();
                }
            }, { once: true });
        });
    }
    
    tryToPlay() {
        // Don't try if already playing or if audio isn't ready
        if (this.isPlaying || this.audio.readyState < 2) return;
        
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.isPlaying = true;
                this.hasStarted = true;
                console.log("Music started playing successfully");
                this.showPlayingIndicator();
            }).catch(error => {
                console.log("Autoplay blocked, waiting for user interaction");
                this.showPlayHint();
            });
        }
    }
    
    play() {
        if (this.isPlaying) return;
        
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.hasStarted = true;
            console.log("Music started after user interaction");
            this.showPlayingIndicator();
            this.hidePlayHint();
            
            // Save that music is now playing
            localStorage.setItem('musicIsPlaying', 'true');
        }).catch(error => {
            console.error("Failed to play music:", error);
        });
    }
    
    showPlayHint() {
        // Remove any existing hint
        this.hidePlayHint();
        
        // Create hint element
        const hint = document.createElement('div');
        hint.id = 'music-play-hint';
        hint.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #ff3366;
                color: white;
                padding: 12px 18px;
                border-radius: 12px;
                font-family: 'Pixelify Sans', sans-serif;
                font-size: 14px;
                z-index: 10000;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 10px;
                animation: pulse-hint 1.5s infinite;
                border: 2px solid white;
            ">
                <i class="fas fa-play-circle" style="font-size: 18px;"></i>
                Click to play music
            </div>
        `;
        
        // Add click handler
        hint.addEventListener('click', (e) => {
            e.stopPropagation();
            this.play();
        });
        
        document.body.appendChild(hint);
        
        // Auto-remove after 15 seconds
        setTimeout(() => this.hidePlayHint(), 15000);
    }
    
    hidePlayHint() {
        const hint = document.getElementById('music-play-hint');
        if (hint) {
            hint.style.opacity = '0';
            hint.style.transform = 'translateY(20px)';
            hint.style.transition = 'all 0.5s';
            
            setTimeout(() => {
                if (hint.parentNode) {
                    hint.parentNode.removeChild(hint);
                }
            }, 500);
        }
    }
    
    showPlayingIndicator() {
        // Remove any existing indicator
        this.hidePlayingIndicator();
        
        // Create playing indicator
        const indicator = document.createElement('div');
        indicator.id = 'music-playing-indicator';
        indicator.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(76, 175, 80, 0.9);
                color: white;
                padding: 8px 15px;
                border-radius: 10px;
                font-family: 'Pixelify Sans', sans-serif;
                font-size: 13px;
                z-index: 9999;
                box-shadow: 0 3px 10px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                gap: 8px;
                border: 2px solid white;
            ">
                <i class="fas fa-music" style="font-size: 16px;"></i>
                Music is playing
            </div>
        `;
        
        document.body.appendChild(indicator);
        
        // Auto-remove after 3 seconds
        setTimeout(() => this.hidePlayingIndicator(), 3000);
    }
    
    hidePlayingIndicator() {
        const indicator = document.getElementById('music-playing-indicator');
        if (indicator) {
            indicator.style.opacity = '0';
            indicator.style.transition = 'opacity 0.5s';
            
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }, 500);
        }
    }
}

// Initialize music player
document.addEventListener('DOMContentLoaded', function() {
    // Start the music player
    window.musicPlayer = new SimpleMusicPlayer();
    
    // Add interactive elements
    addInteractiveElements();
    
    // Check if we should auto-play based on previous state
    setTimeout(() => {
        const wasPlaying = localStorage.getItem('musicIsPlaying') === 'true';
        if (wasPlaying && window.musicPlayer && !window.musicPlayer.isPlaying) {
            window.musicPlayer.play();
        }
    }, 500);
});

// Add interactive elements
function addInteractiveElements() {
    // Add click effects to buttons
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create a ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size/2;
            const y = e.clientY - rect.top - size/2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.7);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                width: ${size}px;
                height: ${size}px;
                top: ${y}px;
                left: ${x}px;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Title hover effect
    const title = document.querySelector('h1');
    if (title) {
        title.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s';
        });
        
        title.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
    
    // Add floating hearts
    addFloatingHearts();
}

// Add floating hearts
function addFloatingHearts() {
    const container = document.querySelector('.floating-hearts');
    if (!container) return;
    
    const heartCount = window.innerWidth < 768 ? 5 : 10;
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerHTML = ['❤️', '💖', '💗', '💕', '💞'][Math.floor(Math.random() * 5)];
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.animationDelay = `${Math.random() * 5}s`;
        heart.style.fontSize = `${Math.random() * 15 + 10}px`;
        container.appendChild(heart);
    }
}

// Add styles
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes pulse-hint {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);