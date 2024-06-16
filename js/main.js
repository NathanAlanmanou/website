document.addEventListener('DOMContentLoaded', () => {
    handleNavigation();

    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const sectionId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            showSection(sectionId);
            event.preventDefault();
        });
    });
});

window.addEventListener('popstate', (event) => {
    handleNavigation();
});

function showSection(sectionId) {
    const sections = document.querySelectorAll('#content > section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
    } else {
        console.error('Section with ID ' + sectionId + ' not found.');
    }

    updateActiveLink(sectionId);
    updateURL(sectionId);
}

function updateActiveLink(activeSectionId) {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        const sectionName = link.getAttribute('onclick').match(/'([^']+)'/)[1];
        if (sectionName === activeSectionId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function updateURL(sectionId) {
    const newURL = `/${sectionId}`;
    history.pushState({ section: sectionId }, '', newURL);
}

function handleNavigation() {
    const pathSegments = window.location.pathname.split('/').filter(segment => segment);
    const sectionId = pathSegments[0];

    if (sectionId) {
        showSection(sectionId);
    } else {
        const savedSection = localStorage.getItem('activeSection') || 'dashboard';
        showSection(savedSection);
    }
}
