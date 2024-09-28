document.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.getElementById('menu-icon');
    const navMenu = document.getElementById('nav-menu');

    menuIcon.addEventListener('click', () => {
        menuIcon.classList.toggle('open');
        navMenu.classList.toggle('open');
    });
});





window.addEventListener('scroll', function() {
    var imageSection = document.getElementById('imageSection');
    var sectionPosition = imageSection.getBoundingClientRect().top;
    var screenPosition = window.innerHeight / 1.3;
  
    if (sectionPosition < screenPosition) {
        imageSection.classList.add('visible');
    } else {
        imageSection.classList.remove('visible');
    }
  });
  
  
  window.addEventListener('scroll', function() {
      var imageSection = document.getElementById('imageSection2');
      var sectionPosition = imageSection.getBoundingClientRect().top;
      var screenPosition = window.innerHeight / 1.3;
    
      if (sectionPosition < screenPosition) {
          imageSection.classList.add('visible');
      } else {
          imageSection.classList.remove('visible');
      }
    });
    
    
  
    window.addEventListener('scroll', function() {
      var imageSection = document.getElementById('imageSection3');
      var sectionPosition = imageSection.getBoundingClientRect().top;
      var screenPosition = window.innerHeight / 1.3;
    
      if (sectionPosition < screenPosition) {
          imageSection.classList.add('visible');
      } else {
          imageSection.classList.remove('visible');
      }
    });
    
    
  