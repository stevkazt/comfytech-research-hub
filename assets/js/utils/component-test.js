/**
 * FILE: component-test.js (137 lines) 
 * PURPOSE: Test all modular HTML components for proper loading
 * SECTIONS:
 * 1-30: Test utilities and setup
 * 31-80: Component loading tests
 * 81-137: Integration tests and reporting
 * KEY FUNCTIONS:
 * - testComponentLoad()
 * - runAllTests()
 * - generateReport()
 * LAST UPDATED: 2025-06-16 — Updated line count for modular architecture compliance
 */

class ComponentTester {
    constructor() {
        this.results = [];
        this.components = [
            { path: 'assets/components/header.html', name: 'Header' },
            { path: 'assets/components/footer.html', name: 'Footer' },
            { path: 'assets/components/mobile-warning.html', name: 'Mobile Warning' },
            { path: 'assets/components/dashboard-welcome.html', name: 'Dashboard Welcome' },
            { path: 'assets/components/dashboard-stats.html', name: 'Dashboard Stats' },
            { path: 'assets/components/dashboard-features.html', name: 'Dashboard Features' },
            { path: 'assets/components/dashboard-getting-started.html', name: 'Getting Started' },
            { path: 'assets/components/product-controls.html', name: 'Product Controls' },
            { path: 'assets/components/product-grid.html', name: 'Product Grid' },
            { path: 'assets/components/product-details-header.html', name: 'Product Details Header' }
        ];
    }

    async testComponentLoad(component) {
        try {
            console.log(`🧪 Testing component: ${component.name}`);

            const response = await fetch(component.path);
            const html = await response.text();

            // Test basic loading
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Test content validity
            if (!html || html.trim().length === 0) {
                throw new Error('Component returned empty content');
            }

            // Test if it's valid HTML (basic check)
            if (!html.includes('<') || !html.includes('>')) {
                throw new Error('Component does not appear to contain valid HTML');
            }

            // Test for FILE header comment (as per AI instructions)
            if (!html.includes('FILE:') || !html.includes('PURPOSE:')) {
                console.warn(`⚠️ Component ${component.name} missing FILE documentation header`);
            }

            this.results.push({
                component: component.name,
                path: component.path,
                status: 'PASS',
                message: 'Component loaded successfully',
                size: html.length
            });

            console.log(`✅ ${component.name} - PASS`);
            return true;

        } catch (error) {
            this.results.push({
                component: component.name,
                path: component.path,
                status: 'FAIL',
                message: error.message,
                size: 0
            });

            console.error(`❌ ${component.name} - FAIL: ${error.message}`);
            return false;
        }
    }

    async runAllTests() {
        console.log('🚀 Starting Component Architecture Tests...\n');

        let passCount = 0;
        const totalTests = this.components.length;

        for (const component of this.components) {
            const success = await this.testComponentLoad(component);
            if (success) passCount++;

            // Small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log('\n📊 Test Results Summary:');
        console.log(`✅ Passed: ${passCount}/${totalTests}`);
        console.log(`❌ Failed: ${totalTests - passCount}/${totalTests}`);

        return {
            total: totalTests,
            passed: passCount,
            failed: totalTests - passCount,
            results: this.results
        };
    }

    generateReport() {
        const report = [
            '# Component Architecture Test Report',
            `Generated: ${new Date().toISOString()}`,
            '',
            '## Results Summary',
            `- Total Components: ${this.results.length}`,
            `- Passed: ${this.results.filter(r => r.status === 'PASS').length}`,
            `- Failed: ${this.results.filter(r => r.status === 'FAIL').length}`,
            '',
            '## Detailed Results'
        ];

        this.results.forEach(result => {
            const status = result.status === 'PASS' ? '✅' : '❌';
            report.push(`${status} **${result.component}** - ${result.message}`);
            if (result.status === 'PASS') {
                report.push(`   - Size: ${result.size} bytes`);
            }
            report.push('');
        });

        return report.join('\n');
    }
}

// Export for global use
window.ComponentTester = ComponentTester;
