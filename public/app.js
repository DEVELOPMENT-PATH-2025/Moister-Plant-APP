/**
 * Nexus IoT Monitoring - Main Application Logic
 * Handles IR Sensor simulation and Soil Moisture analytics.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Shared Theme Logic
    const initTheme = () => {
        const savedTheme = localStorage.getItem('nexus_theme') || 'dark';
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            const themeIcon = document.getElementById('themeIcon');
            if (themeIcon) themeIcon.innerHTML = '<path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />';
        }
    };

    const toggleTheme = () => {
        const isLight = document.body.classList.toggle('light-mode');
        localStorage.setItem('nexus_theme', isLight ? 'light' : 'dark');
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.innerHTML = isLight 
                ? '<path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />'
                : '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />';
        }
    };

    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
    initTheme();

    // Route Detection
    const path = window.location.pathname;
    if (path.includes('ir-dashboard.html')) {
        initIRDashboard();
    } else if (path.includes('moisture-dashboard.html')) {
        initMoistureDashboard();
    }
});

/**
 * FEATURE 1: IR SENSOR DASHBOARD LOGIC
 */
function initIRDashboard() {
    let detectionCount = 0;
    let isSensorOn = true;
    const ctx = document.getElementById('activityChart')?.getContext('2d');
    
    // UI Elements
    const statusEl = document.getElementById('detectionStatus');
    const countEl = document.getElementById('detectionCount');
    const timeEl = document.getElementById('lastDetectionTime');
    const tableBody = document.getElementById('logTableBody');
    const pingEl = document.getElementById('detectionPing');
    const toggleEl = document.getElementById('sensorToggle');

    if (!ctx) return;

    // Chart Configuration
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(10).fill(''),
            datasets: [{
                label: 'Signal Intensity',
                data: Array(10).fill(0),
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { display: false, min: 0, max: 100 },
                x: { display: false }
            },
            plugins: { legend: { display: false } }
        }
    });

    // Toggle logic
    toggleEl?.addEventListener('change', (e) => {
        isSensorOn = e.target.checked;
        if (!isSensorOn) {
            statusEl.textContent = "SYSTEM OFFLINE";
            statusEl.className = "text-2xl font-space font-bold text-[#475569]";
        }
    });

    // Simulation Loop (Every 2 seconds)
    setInterval(() => {
        if (!isSensorOn) return;

        const isDetected = Math.random() > 0.7;
        const timestamp = new Date().toLocaleTimeString();
        const intensity = isDetected ? 70 + Math.random() * 30 : 10 + Math.random() * 20;

        // Update Chart
        chart.data.datasets[0].data.push(intensity);
        chart.data.datasets[0].data.shift();
        chart.update('none');

        if (isDetected) {
            detectionCount++;
            countEl.textContent = detectionCount;
            timeEl.textContent = timestamp;
            statusEl.textContent = "OBJECT DETECTED";
            statusEl.className = "text-2xl font-space font-bold text-red-500 animate-pulse";
            
            // Ping Animation
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            pingEl.style.left = `${x}%`;
            pingEl.style.top = `${y}%`;
            pingEl.classList.remove('opacity-0');
            setTimeout(() => pingEl.classList.add('opacity-0'), 1000);

            // Log entry: ID, Classification, Prob, Velocity, Time
            addLogEntry(tableBody, detectionCount, "BIOMETRIC", "0.99", "2.4m/s", timestamp);
            
            // Notification
            showNotice("Security Breach", "Unauthorized presence detected", "red");
        } else {
            statusEl.textContent = "SCANNING...";
            statusEl.className = "text-2xl font-space font-bold text-[#00F2FF]";
        }
    }, 2000);
}

/**
 * FEATURE 2: SOIL MOISTURE DASHBOARD LOGIC
 */
function initMoistureDashboard() {
    let isPumpOn = false;
    const ctx = document.getElementById('moistureChart')?.getContext('2d');
    
    // UI Elements
    const moistureValEl = document.getElementById('moistureValue');
    const plantStatusEl = document.getElementById('plantStatus');
    const circleEl = document.getElementById('moistureProgressCircle');
    const innerStatusEl = document.getElementById('statusIndicatorInner');
    const tempEl = document.getElementById('tempValue');
    const humEl = document.getElementById('humidityValue');
    const pumpTrigger = document.getElementById('manualPumpTrigger');
    const pumpDot = document.getElementById('pumpStatusDot');
    const pumpText = document.getElementById('pumpStatusText');
    const pumpDashboardText = document.getElementById('pumpDashboardStatus');
    const tableBody = document.getElementById('moistureLogTable');

    if (!ctx) return;

    // Chart Configuration
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(10).fill(''),
            datasets: [{
                label: 'Saturation %',
                data: Array(10).fill(45),
                borderColor: '#39FF14',
                borderWidth: 2,
                tension: 0.4,
                pointBackgroundColor: '#39FF14',
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { min: 0, max: 100, ticks: { color: '#64748b', font: { size: 9 } }, grid: { borderDash: [5, 5], color: 'rgba(255,255,255,0.05)' } },
                x: { display: false }
            },
            plugins: { legend: { display: false } }
        }
    });

    // Pump Toggle
    pumpTrigger?.addEventListener('click', () => {
        isPumpOn = !isPumpOn;
        updatePumpUI(isPumpOn, pumpDot, pumpText, pumpDashboardText, pumpTrigger);
    });

    // Simulation Loop (Every 3 seconds)
    setInterval(() => {
        // Natural depletion or pump replenishment
        let currentMoisture = parseInt(moistureValEl.textContent);
        if (isPumpOn) {
            currentMoisture += 5;
            if (currentMoisture >= 85) isPumpOn = false; // Auto shutoff
        } else {
            currentMoisture -= 1;
        }

        // Constraints
        currentMoisture = Math.max(15, Math.min(95, currentMoisture));
        
        // Update UI
        moistureValEl.textContent = `${currentMoisture}%`;
        tempEl.textContent = (22 + Math.random() * 4).toFixed(1);
        humEl.textContent = (50 + Math.random() * 20).toFixed(0);

        // Progress Circle (circumference ~628.32 for r=100)
        const offset = 628.32 - (currentMoisture / 100) * 628.32;
        circleEl.style.strokeDashoffset = offset;
        innerStatusEl.style.width = `${currentMoisture}%`;

        // Plant Status
        if (currentMoisture < 30) {
            plantStatusEl.textContent = "CRITICAL";
            plantStatusEl.className = "text-[#ff4444]";
            innerStatusEl.className = "h-full bg-red-500 transition-all duration-500";
            showNotice("Water Deficiency", "Moisture below 30% threshold", "red");
            if (!isPumpOn) {
                 isPumpOn = true; // Auto-irrigation simulation
                 addLogEvent(tableBody, currentMoisture, "AUTO_FLUSH", "RECOV_MODE");
            }
        } else if (currentMoisture > 80) {
            plantStatusEl.textContent = "SATURATED";
            plantStatusEl.className = "text-[#00F2FF]";
            innerStatusEl.className = "h-full bg-[#00F2FF] transition-all duration-500";
        } else {
            plantStatusEl.textContent = "OPTIMAL";
            plantStatusEl.className = "text-[#39FF14]";
            innerStatusEl.className = "h-full bg-[#39FF14] transition-all duration-500";
        }

        updatePumpUI(isPumpOn, pumpDot, pumpText, pumpDashboardText, pumpTrigger);

        // Chart Update
        chart.data.datasets[0].data.push(currentMoisture);
        chart.data.datasets[0].data.shift();
        chart.update('none');

    }, 3000);
}

// Utility Helpers
function addLogEntry(parent, id, type, prob, vel, time) {
    if (!parent) return;
    const row = document.createElement('tr');
    row.className = "border-b border-[#1E293B] hover:bg-white/5 transition-colors";
    row.innerHTML = `
        <td class="py-3 font-mono text-[#475569]">#${id.toString().padStart(4, '0')}</td>
        <td class="py-3"><span class="px-2 py-0.5 bg-[#00F2FF]/5 text-[#00F2FF] text-[9px] rounded-sm uppercase font-bold border border-[#00F2FF]/20">${type}</span></td>
        <td class="py-3 text-[#E2E8F0] font-mono">${prob}</td>
        <td class="py-3 text-[#E2E8F0] font-mono">${vel}</td>
        <td class="py-3 text-[#475569] font-mono uppercase">${time}</td>
    `;
    parent.prepend(row);
    if (parent.children.length > 8) parent.lastElementChild.remove();
}

function addLogEvent(parent, moisture, proto, state) {
    if (!parent) return;
    const row = document.createElement('tr');
    row.className = "border-b border-[#1E293B] hover:bg-white/5 transition-colors";
    row.innerHTML = `
        <td class="py-3 text-[#475569] font-mono uppercase">${new Date().toLocaleTimeString()}</td>
        <td class="py-3 text-white font-bold font-mono">${moisture}%</td>
        <td class="py-3 text-[#39FF14] font-bold font-space">${proto}</td>
        <td class="py-3"><span class="px-2 py-0.5 bg-white/5 text-[#E2E8F0] text-[9px] rounded-sm uppercase font-bold border border-white/10 tracking-widest">${state}</span></td>
    `;
    parent.prepend(row);
    if (parent.children.length > 8) parent.lastElementChild.remove();
}

function updatePumpUI(isOn, dot, text, dashText, btn) {
    if (!dot || !text || !dashText) return;
    
    if (isOn) {
        dot.className = "w-1.5 h-1.5 rounded-full bg-[#39FF14] shadow-[0_0_8px_#39FF14]";
        text.textContent = "Irrigating";
        text.className = "text-[#39FF14] text-[11px] font-bold tracking-wider uppercase";
        dashText.textContent = "SYNCHED FLOW";
        dashText.className = "mt-4 text-xl font-space font-bold text-[#39FF14]";
        btn.textContent = "Halt System";
        btn.className = "px-5 py-2 rounded-lg bg-[#39FF14] text-black text-[11px] font-bold tracking-wider uppercase hover:bg-[#39FF14]/80 transition-all";
        document.querySelector('.relative.overflow-hidden.group')?.classList.add('active');
    } else {
        dot.className = "w-1.5 h-1.5 rounded-full bg-[#1E293B]";
        text.textContent = "Standby";
        text.className = "text-[11px] font-bold tracking-wider text-[#64748B] uppercase";
        dashText.textContent = "OFFLINE";
        dashText.className = "mt-4 text-xl font-space font-bold text-[#64748B]";
        btn.textContent = "Manual Overflow";
        btn.className = "px-5 py-2 rounded-lg border border-[#39FF14]/30 text-[#39FF14] text-[11px] font-bold tracking-wider uppercase hover:bg-[#39FF14]/10 transition-all";
        document.querySelector('.relative.overflow-hidden.group')?.classList.remove('active');
    }
}

function showNotice(title, msg, color) {
    const area = document.getElementById('notificationArea') || document.getElementById('moistureNotification');
    if (!area) return;

    const notice = document.createElement('div');
    const colorClass = color === 'cyan' ? 'border-cyan-500 bg-cyan-500/10' : 'border-red-500 bg-red-500/10';
    const textClass = color === 'cyan' ? 'text-cyan-400' : 'text-red-400';

    notice.className = `p-4 rounded-xl border ${colorClass} backdrop-blur-xl animate-slide-in min-w-[280px] shadow-2xl`;
    notice.innerHTML = `
        <div class="flex items-center gap-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-black/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${textClass}"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div>
                <h4 class="text-sm font-bold text-white">${title}</h4>
                <p class="text-xs text-gray-400">${msg}</p>
            </div>
        </div>
    `;
    area.appendChild(notice);
    setTimeout(() => {
        notice.style.opacity = '0';
        notice.style.transform = 'translateX(20px)';
        setTimeout(() => notice.remove(), 500);
    }, 4000);
}
