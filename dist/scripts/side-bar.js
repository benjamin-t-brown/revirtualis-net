window.sideBar = {
  open: () => {
    isOpen = true;
    document.querySelector('.side-bar-container').style.transform =
      'translateX(0)';
  },
  close: () => {
    isOpen = false;
    document.querySelector('.side-bar-container').style.transform =
      'translateX(-200%)';
  },
};

let isOpen = window.innerWidth > 1000;
window.addEventListener('resize', () => {
  if (window.innerWidth < 1000 && isOpen) {
    window.sideBar.close();
  }
  if( window.innerWidth > 1000 && !isOpen) {
    window.sideBar.open();
  }
});
