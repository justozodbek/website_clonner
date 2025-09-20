// Enhanced Application Logic
class ClonifyApp {
    constructor() {
        this.elements = this.initializeElements();
        this.setupEventListeners();
        this.setupAnimations();
    }

    initializeElements() {
        return {
            cloneBtn: document.getElementById('cloneBtn'),
            websiteUrl: document.getElementById('websiteUrl'),
            loadingIndicator: document.getElementById('loadingIndicator'),
            errorMessage: document.getElementById('errorMessage'),
            successMessage: document.getElementById('successMessage'),
            resultsSection: document.getElementById('resultsSection'),
            previewSection: document.getElementById('previewSection'),
            htmlCode: document.getElementById('htmlCode'),
            cssCode: document.getElementById('cssCode'),
            jsCode: document.getElementById('jsCode'),
            resourcesCode: document.getElementById('resourcesCode'),
            previewIframe: document.getElementById('previewIframe'),
            refreshPreview: document.getElementById('refreshPreview'),
            openInNewTab: document.getElementById('openInNewTab'),
            downloadBtn: document.getElementById('downloadBtn'),
            tabs: document.querySelectorAll('.tab')
        };
    }

    setupEventListeners() {
        // Tab functionality with enhanced animations
        this.elements.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.handleTabClick(e));
        });

        // Clone button with loading states
        this.elements.cloneBtn.addEventListener('click', () => this.handleCloneRequest());

        // Enhanced input handling
        this.elements.websiteUrl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.elements.cloneBtn.click();
            }
        });

        this.elements.websiteUrl.addEventListener('input', () => this.validateInput());

        // Preview controls
        this.elements.refreshPreview.addEventListener('click', () => this.refreshPreview());
        this.elements.openInNewTab.addEventListener('click', () => this.openInNewTab());
        this.elements.downloadBtn.addEventListener('click', () => this.downloadWebsite());

        // Enhanced keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    setupAnimations() {
        // Staggered animation for elements
        const animationDelay = 200;
        const elementsToAnimate = [
            this.elements.websiteUrl,
            this.elements.cloneBtn
        ];

        elementsToAnimate.forEach((element, index) => {
            if (element) {
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';

                setTimeout(() => {
                    element.style.transition = 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, index * animationDelay + 800);
            }
        });
    }

    handleTabClick(event) {
        const clickedTab = event.target;
        const tabName = clickedTab.getAttribute('data-tab');

        // Remove active class from all tabs
        this.elements.tabs.forEach(tab => {
            tab.classList.remove('active');
            tab.style.transform = 'scale(1)';
        });

        // Add active class to clicked tab with animation
        clickedTab.classList.add('active');
        clickedTab.style.transform = 'scale(1.05)';

        setTimeout(() => {
            clickedTab.style.transform = 'scale(1)';
        }, 150);

        // Hide all code displays with fade effect
        const codeDisplays = document.querySelectorAll('.code-display');
        codeDisplays.forEach(display => {
            display.style.opacity = '0';
            display.style.transform = 'translateY(10px)';

            setTimeout(() => {
                display.style.display = 'none';
            }, 200);
        });

        // Show the selected code display with fade effect
        setTimeout(() => {
            const targetDisplay = document.getElementById(tabName + 'Code');
            if (targetDisplay) {
                targetDisplay.style.display = 'block';
                targetDisplay.style.opacity = '0';
                targetDisplay.style.transform = 'translateY(10px)';

                setTimeout(() => {
                    targetDisplay.style.transition = 'all 0.4s ease';
                    targetDisplay.style.opacity = '1';
                    targetDisplay.style.transform = 'translateY(0)';
                }, 50);
            }
        }, 200);
    }

    validateInput() {
        const url = this.elements.websiteUrl.value.trim();
        const isValid = this.isValidUrl(url);

        if (url && !isValid) {
            this.elements.websiteUrl.style.borderColor = 'var(--accent)';
            this.elements.websiteUrl.style.boxShadow = '0 0 0 3px rgba(247, 37, 133, 0.2)';
        } else {
            this.elements.websiteUrl.style.borderColor = 'var(--border)';
            this.elements.websiteUrl.style.boxShadow = 'none';
        }

        return isValid;
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (e) {
            return false;
        }
    }

    async handleCloneRequest() {
        const url = this.elements.websiteUrl.value.trim();

        if (!url) {
            this.showError('Please enter a website URL');
            this.shakeElement(this.elements.websiteUrl);
            return;
        }

        if (!this.isValidUrl(url)) {
            this.showError('Please enter a valid URL (e.g., https://example.com)');
            this.shakeElement(this.elements.websiteUrl);
            return;
        }

        // Enhanced loading state
        this.setLoadingState(true);
        this.hideMessages();
        this.hideSections();

        try {
            const result = await this.cloneWebsite(url);
            this.displayResults(result);
            this.showSuccess('Website cloned successfully!');
        } catch (error) {
            console.error('Cloning error:', error);
            this.showError('Failed to clone website. This may be due to CORS restrictions or the website not being accessible.');
        } finally {
            this.setLoadingState(false);
        }
    }

    async cloneWebsite(url) {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (!data.contents) {
            throw new Error('Could not retrieve website content');
        }

        return this.processWebsiteContent(data.contents);
    }

    processWebsiteContent(htmlContent) {
        // Extract CSS
        const cssMatches = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
        let combinedCss = '';
        cssMatches.forEach(match => {
            const cssContent = match.replace(/<style[^>]*>|<\/style>/gi, '');
            combinedCss += cssContent + '\n\n';
        });

        // Extract JavaScript
        const jsMatches = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
        let combinedJs = '';
        jsMatches.forEach(match => {
            const jsContent = match.replace(/<script[^>]*>|<\/script>/gi, '');
            if (jsContent.trim() && !match.includes('src=')) {
                combinedJs += jsContent + '\n\n';
            }
        });

        // Extract resources
        const resources = this.extractResources(htmlContent);

        return {
            html: htmlContent,
            css: combinedCss || 'No internal CSS found',
            js: combinedJs || 'No internal JavaScript found',
            resources: resources
        };
    }

    extractResources(htmlContent) {
        const linkMatches = htmlContent.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/gi) || [];
        const scriptMatches = htmlContent.match(/<script[^>]+src=["']([^"']+)["'][^>]*>/gi) || [];
        const imgMatches = htmlContent.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi) || [];

        let resourcesText = 'External Resources:\n\n';

        if (linkMatches.length > 0) {
            resourcesText += '📄 CSS Files:\n';
            linkMatches.forEach(link => {
                if (link.includes('stylesheet')) {
                    const hrefMatch = link.match(/href=["']([^"']+)["']/);
                    if (hrefMatch && hrefMatch[1]) {
                        resourcesText += `  • ${hrefMatch[1]}\n`;
                    }
                }
            });
            resourcesText += '\n';
        }

        if (scriptMatches.length > 0) {
            resourcesText += '⚡ JavaScript Files:\n';
            scriptMatches.forEach(script => {
                const srcMatch = script.match(/src=["']([^"']+)["']/);
                if (srcMatch && srcMatch[1]) {
                    resourcesText += `  • ${srcMatch[1]}\n`;
                }
            });
            resourcesText += '\n';
        }

        if (imgMatches.length > 0) {
            resourcesText += '🖼️ Images:\n';
            const uniqueImages = [...new Set(imgMatches.map(img => {
                const srcMatch = img.match(/src=["']([^"']+)["']/);
                return srcMatch ? srcMatch[1] : null;
            }).filter(Boolean))];

            uniqueImages.slice(0, 20).forEach(src => {
                resourcesText += `  • ${src}\n`;
            });

            if (uniqueImages.length > 20) {
                resourcesText += `  ... and ${uniqueImages.length - 20} more images\n`;
            }
        }

        return resourcesText;
    }

    displayResults(result) {
        // Update code displays with syntax highlighting effect
        this.updateCodeDisplay(this.elements.htmlCode, result.html);
        this.updateCodeDisplay(this.elements.cssCode, result.css);
        this.updateCodeDisplay(this.elements.jsCode, result.js);
        this.updateCodeDisplay(this.elements.resourcesCode, result.resources);

        // Create and display preview
        this.createPreview(result.html);

        // Show results with staggered animation
        this.showSections();
    }

    updateCodeDisplay(element, content) {
        const pre = element.querySelector('pre');
        if (pre) {
            // Add typing effect
            pre.textContent = '';
            this.typeText(pre, content, 30);
        }
    }

    typeText(element, text, speed = 50) {
        const words = text.split(' ');
        let wordIndex = 0;

        const typeWord = () => {
            if (wordIndex < words.length) {
                element.textContent += (wordIndex > 0 ? ' ' : '') + words[wordIndex];
                wordIndex++;
                setTimeout(typeWord, speed);
            }
        };

        typeWord();
    }

    createPreview(htmlContent) {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const blobUrl = URL.createObjectURL(blob);
        this.elements.previewIframe.src = blobUrl;
        this.currentBlobUrl = blobUrl;
    }

    refreshPreview() {
        if (this.elements.previewIframe.src) {
            // Add refresh animation
            this.elements.previewIframe.style.opacity = '0.5';
            this.elements.previewIframe.style.transform = 'scale(0.95)';

            setTimeout(() => {
                this.elements.previewIframe.contentWindow.location.reload();

                setTimeout(() => {
                    this.elements.previewIframe.style.opacity = '1';
                    this.elements.previewIframe.style.transform = 'scale(1)';
                }, 500);
            }, 200);
        }
    }

    openInNewTab() {
        if (this.elements.previewIframe.src) {
            window.open(this.elements.previewIframe.src, '_blank');
        }
    }

    downloadWebsite() {
        const htmlContent = this.elements.htmlCode.querySelector('pre').textContent;

        if (!htmlContent || htmlContent === '// HTML code will appear here after cloning') {
            this.showError('No website content to download');
            return;
        }

        // Create enhanced download with filename based on URL
        const url = this.elements.websiteUrl.value.trim();
        let filename = 'website-clone.html';

        try {
            const urlObj = new URL(url);
            filename = `${urlObj.hostname.replace(/\./g, '_')}_clone.html`;
        } catch (e) {
            // Use default filename
        }

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);

        // Show success feedback
        this.showSuccess(`Downloaded as ${filename}`);
        this.bounceElement(this.elements.downloadBtn);
    }

    setLoadingState(loading) {
        if (loading) {
            this.elements.loadingIndicator.style.display = 'flex';
            this.elements.cloneBtn.style.opacity = '0.7';
            this.elements.cloneBtn.style.pointerEvents = 'none';
            this.elements.cloneBtn.innerHTML = `
                <div class="spinner" style="width: 20px; height: 20px; margin: 0; margin-right: 0.5rem;"></div>
                Cloning...
            `;
        } else {
            this.elements.loadingIndicator.style.display = 'none';
            this.elements.cloneBtn.style.opacity = '1';
            this.elements.cloneBtn.style.pointerEvents = 'auto';
            this.elements.cloneBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                Clone Website
            `;
        }
    }

    showSections() {
        const sections = [this.elements.resultsSection, this.elements.previewSection];

        sections.forEach((section, index) => {
            setTimeout(() => {
                section.style.display = 'block';
                section.style.opacity = '0';
                section.style.transform = 'translateY(30px)';

                setTimeout(() => {
                    section.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
                    section.style.opacity = '1';
                    section.style.transform = 'translateY(0)';
                }, 100);
            }, index * 200);
        });
    }

    hideSections() {
        [this.elements.resultsSection, this.elements.previewSection].forEach(section => {
            section.style.display = 'none';
        });
    }

    hideMessages() {
        [this.elements.errorMessage, this.elements.successMessage].forEach(message => {
            message.style.display = 'none';
        });
    }

    showError(message) {
        const messageElement = this.elements.errorMessage;
        messageElement.querySelector('span').textContent = message;
        messageElement.style.display = 'flex';
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(-10px)';

        setTimeout(() => {
            messageElement.style.transition = 'all 0.4s ease';
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        }, 50);

        // Auto-hide after 5 seconds
        setTimeout(() => this.hideMessages(), 5000);
    }

    showSuccess(message) {
        const messageElement = this.elements.successMessage;
        messageElement.querySelector('span').textContent = message;
        messageElement.style.display = 'flex';
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(-10px)';

        setTimeout(() => {
            messageElement.style.transition = 'all 0.4s ease';
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        }, 50);

        // Auto-hide after 3 seconds
        setTimeout(() => this.hideMessages(), 3000);
    }

    shakeElement(element) {
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);

        // Add shake keyframes if not already present
        if (!document.getElementById('shake-styles')) {
            const style = document.createElement('style');
            style.id = 'shake-styles';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    bounceElement(element) {
        element.style.animation = 'bounce 0.6s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 600);

        // Add bounce keyframes if not already present
        if (!document.getElementById('bounce-styles')) {
            const style = document.createElement('style');
            style.id = 'bounce-styles';
            style.textContent = `
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-10px); }
                    60% { transform: translateY(-5px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + Enter to clone
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            this.elements.cloneBtn.click();
        }

        // Escape to clear
        if (event.key === 'Escape') {
            this.elements.websiteUrl.value = '';
            this.elements.websiteUrl.focus();
        }

        // Ctrl/Cmd + D to download
        if ((event.ctrlKey || event.metaKey) && event.key === 'd' && this.elements.previewSection.style.display === 'block') {
            event.preventDefault();
            this.downloadWebsite();
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new ClonifyApp();
});

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log(`Page load time: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
        }, 0);
    });
}
