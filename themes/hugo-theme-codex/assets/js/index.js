/*
 * Handles mobile nav
 */

function toggleMobileNavState() {
  const body = document.querySelector("body");
  body.classList.toggle("nav--active");
}

/*
 * Initializes burger functionality
 */

function initBurger() {
  const burger = document.querySelector(".burger");
  burger.addEventListener("click", toggleMobileNavState);
}

initBurger();

document.addEventListener('DOMContentLoaded', (event) => {
  ((localStorage.getItem('mode') || 'dark') === 'dark') ? document.querySelectorAll('.switchme').forEach(function(item){item.classList.add('dark');}) : document.querySelectorAll('.switchme').forEach(function(item){item.classList.remove('dark');})
});

//  document.querySelectorAll('.switchme').forEach(function(item){item.classList.add('dark');})
//document.querySelector('.switchme').classList.add('dark')