// typewriter.js - Typing animation effect
document.addEventListener('DOMContentLoaded', () => {
  const textElement = document.getElementById('typewriterText');
  if (!textElement) return;

  const phrases = [
    "Phishing Detection",
    "Password Analysis", 
    "Threat Intelligence",
    "Email Security",
    "Security Awareness",
    "Real-Time Defense"
  ];
  
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 80;
  
  function type() {
    const currentPhrase = phrases[phraseIndex];
    
    if (isDeleting) {
      textElement.innerText = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 40;
    } else {
      textElement.innerText = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 80;
    }
    
    let delay = typeSpeed;
    
    // If word is complete
    if (!isDeleting && charIndex === currentPhrase.length) {
      delay = 1500; // Pause at end of word
      isDeleting = true;
    } 
    // If word is completely deleted
    else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 500; // Pause before new word
    }
    
    setTimeout(type, delay);
  }
  
  // Start the animation
  setTimeout(type, 1000);
});
