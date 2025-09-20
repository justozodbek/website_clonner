// Advanced Background Animation System
class BackgroundSystem {
    constructor() {
        this.canvas = document.getElementById('backgroundCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.geometryNodes = [];
        this.mousePosition = { x: 0, y: 0 };
        this.cursor = document.querySelector('.custom-cursor');
        this.cursorTrails = [];

        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        this.resizeCanvas();
        this.createParticles();
        this.createGeometryNodes();
        this.createCursorTrails();

        // Hide default cursor
        document.body.style.cursor = 'none';
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        const particleCount = Math.min(150, Math.floor((this.canvas.width * this.canvas.height) / 8000));

        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                color: this.getRandomColor(),
                pulsePhase: Math.random() * Math.PI * 2,
                connectionDistance: Math.random() * 100 + 80
            });
        }
    }

    createGeometryNodes() {
        const nodeCount = 8;

        for (let i = 0; i < nodeCount; i++) {
            this.geometryNodes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 30 + 20,
                opacity: Math.random() * 0.1 + 0.05,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.01,
                color: this.getRandomColor(),
                shape: Math.floor(Math.random() * 3) // 0: circle, 1: triangle, 2: square
            });
        }
    }

    createCursorTrails() {
        for (let i = 0; i < 8; i++) {
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            document.body.appendChild(trail);
            this.cursorTrails.push({
                element: trail,
                x: 0,
                y: 0,
                opacity: 1 - (i / 8),
                delay: i * 2
            });
        }
    }

    getRandomColor() {
        const colors = [
            'rgba(99, 102, 241, ',
            'rgba(139, 92, 246, ',
            'rgba(6, 214, 160, ',
            'rgba(247, 37, 133, '
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });

        window.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
            this.updateCursor(e.clientX, e.clientY);
            this.updateCursorTrails(e.clientX, e.clientY);
        });

        // Interactive elements
        const interactiveElements = document.querySelectorAll('button, input, a, .card');
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.cursor.style.transform = 'scale(1.5)';
                this.cursor.style.background = 'rgba(6, 214, 160, 0.8)';
            });

            element.addEventListener('mouseleave', () => {
                this.cursor.style.transform = 'scale(1)';
                this.cursor.style.background = 'rgba(99, 102, 241, 0.8)';
            });
        });
    }

    updateCursor(x, y) {
        this.cursor.style.left = x - 10 + 'px';
        this.cursor.style.top = y - 10 + 'px';
    }

    updateCursorTrails(x, y) {
        this.cursorTrails.forEach((trail, index) => {
            setTimeout(() => {
                trail.x += (x - trail.x) * 0.1;
                trail.y += (y - trail.y) * 0.1;

                trail.element.style.left = trail.x - 3 + 'px';
                trail.element.style.top = trail.y - 3 + 'px';
                trail.element.style.opacity = trail.opacity;
            }, index * trail.delay);
        });
    }

    updateParticles() {
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Bounce off edges
            if (particle.x <= 0 || particle.x >= this.canvas.width) particle.vx *= -1;
            if (particle.y <= 0 || particle.y >= this.canvas.height) particle.vy *= -1;

            // Mouse interaction
            const dx = this.mousePosition.x - particle.x;
            const dy = this.mousePosition.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                const force = (150 - distance) / 150;
                particle.x -= (dx / distance) * force * 2;
                particle.y -= (dy / distance) * force * 2;
            }

            // Update pulse animation
            particle.pulsePhase += 0.02;
            particle.currentSize = particle.size + Math.sin(particle.pulsePhase) * 0.5;
        });
    }

    updateGeometryNodes() {
        this.geometryNodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;
            node.rotation += node.rotationSpeed;

            // Bounce off edges
            if (node.x <= -node.size || node.x >= this.canvas.width + node.size) node.vx *= -1;
            if (node.y <= -node.size || node.y >= this.canvas.height + node.size) node.vy *= -1;

            // Mouse interaction
            const dx = this.mousePosition.x - node.x;
            const dy = this.mousePosition.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 200) {
                const force = (200 - distance) / 200;
                node.opacity = Math.min(0.3, node.opacity + force * 0.1);
            } else {
                node.opacity = Math.max(0.05, node.opacity - 0.005);
            }
        });
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color + particle.opacity + ')';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = particle.color + '0.5)';
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.currentSize || particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    drawConnections() {
        this.particles.forEach((particle, i) => {
            this.particles.slice(i + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < particle.connectionDistance) {
                    this.ctx.save();
                    const opacity = (1 - distance / particle.connectionDistance) * 0.2;
                    this.ctx.globalAlpha = opacity;
                    this.ctx.strokeStyle = 'rgba(99, 102, 241, ' + opacity + ')';
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.stroke();
                    this.ctx.restore();
                }
            });
        });
    }

    drawGeometryNodes() {
        this.geometryNodes.forEach(node => {
            this.ctx.save();
            this.ctx.globalAlpha = node.opacity;
            this.ctx.translate(node.x, node.y);
            this.ctx.rotate(node.rotation);

            // Create gradient
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, node.size);
            gradient.addColorStop(0, node.color + '0.3)');
            gradient.addColorStop(1, node.color + '0)');
            this.ctx.fillStyle = gradient;

            switch (node.shape) {
                case 0: // Circle
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, node.size, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;

                case 1: // Triangle
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, -node.size);
                    this.ctx.lineTo(-node.size * 0.866, node.size * 0.5);
                    this.ctx.lineTo(node.size * 0.866, node.size * 0.5);
                    this.ctx.closePath();
                    this.ctx.fill();
                    break;

                case 2: // Square
                    this.ctx.fillRect(-node.size / 2, -node.size / 2, node.size, node.size);
                    break;
            }

            this.ctx.restore();
        });
    }

    drawWaves() {
        const time = Date.now() * 0.001;

        this.ctx.save();
        this.ctx.globalAlpha = 0.1;
        this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
        this.ctx.lineWidth = 2;

        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            for (let x = 0; x <= this.canvas.width; x += 10) {
                const y = this.canvas.height * 0.5 +
                    Math.sin((x * 0.01) + (time * 2) + (i * Math.PI * 0.5)) * 100 +
                    Math.sin((x * 0.005) + (time * 1.5) + (i * Math.PI * 0.3)) * 50;

                if (x === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    animate() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw all elements
        this.updateParticles();
        this.updateGeometryNodes();

        this.drawWaves();
        this.drawGeometryNodes();
        this.drawConnections();
        this.drawParticles();

        // Continue animation
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize background system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BackgroundSystem();
});

// Performance optimization
let ticking = false;

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateAnimations);
        ticking = true;
    }
}

function updateAnimations() {
    // Update any performance-critical animations here
    ticking = false;
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe cards for animation
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
        observer.observe(card);
    });
});
