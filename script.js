// Background Music - Continuous playback across pages
class BackgroundMusic {
    constructor() {
        this.audio = document.getElementById('background-music');
        this.volume = 0.3;
        this.isPlaying = false;
        
        // Check localStorage for saved volume
        const savedVolume = localStorage.getItem('cuteTestVolume');
        if (savedVolume) {
            this.volume = parseFloat(savedVolume);
        }
        
        // Check if music was playing before
        const wasPlaying = localStorage.getItem('cuteTestMusicPlaying') === 'true';
        
        this.init();
        
        // If music was playing on previous page, ensure it continues
        if (wasPlaying && this.audio) {
            this.play();
        }
    }
    
    init() {
        if (!this.audio) return;
        
        // Set initial volume
        this.audio.volume = this.volume;
        
        // Save volume when it changes
        this.audio.addEventListener('volumechange', () => {
            localStorage.setItem('cuteTestVolume', this.audio.volume.toString());
        });
        
        // Save playing state before page unload
        window.addEventListener('beforeunload', () => {
            localStorage.setItem('cuteTestMusicPlaying', this.isPlaying.toString());
            localStorage.setItem('cuteTestCurrentTime', this.audio.currentTime.toString());
        });
        
        // Try to resume from saved time
        const savedTime = localStorage.getItem('cuteTestCurrentTime');
        if (savedTime) {
            this.audio.currentTime = parseFloat(savedTime);
        }
        
        // Try to autoplay
        this.play();
    }
    
    play() {
        if (!this.audio) return;
        
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.isPlaying = true;
                console.log("Background music started playing");
            }).catch(error => {
                console.log("Autoplay prevented. User interaction required.");
                
                // Setup click to play
                const playOnClick = () => {
                    this.audio.play().then(() => {
                        this.isPlaying = true;
                        document.removeEventListener('click', playOnClick);
                        document.removeEventListener('touchstart', playOnClick);
                    });
                };
                
                document.addEventListener('click', playOnClick);
                document.addEventListener('touchstart', playOnClick);
            });
        }
    }
    
    pause() {
        if (!this.audio) return;
        this.audio.pause();
        this.isPlaying = false;
    }
    
    setVolume(level) {
        if (!this.audio) return;
        this.audio.volume = Math.max(0, Math.min(1, level));
        this.volume = this.audio.volume;
    }
}

// Initialize music when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Start background music
    window.cuteBackgroundMusic = new BackgroundMusic();
    
    // Add interactive elements to the main page
    addInteractiveElements();
});

// Add interactive elements to the main page
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
            
            // Remove ripple element after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add a fun message when hovering over the title
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
    
    // Create more floating hearts dynamically
    const floatingHearts = document.querySelector('.floating-hearts');
    if (floatingHearts) {
        const heartCount = window.innerWidth < 768 ? 5 : 10;
        for (let i = 0; i < heartCount; i++) {
            const heart = document.createElement('div');
            heart.classList.add('heart');
            heart.innerHTML = ['❤️', '💖', '💗', '💕', '💞', '💓', '💝'][Math.floor(Math.random() * 7)];
            heart.style.left = `${Math.random() * 100}%`;
            heart.style.animationDelay = `${Math.random() * 5}s`;
            heart.style.fontSize = `${Math.random() * 15 + 10}px`;
            floatingHearts.appendChild(heart);
        }
    }
}

// Add the ripple animation to the styles
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);