class CryptoTicker {
    constructor() {
        this.data = [];
        this.currentSort = {
            column: null,
            direction: 'asc'
        };
        this.init();
    }

    init() {
        this.setupSortingListeners();
        this.fetchData();
        // Update data every 10 seconds
        setInterval(() => this.fetchData(), 10000);
    }

    setupSortingListeners() {
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => this.handleSort(header));
        });
    }

    async fetchData() {
        try {
            // Fetch directly from CoinDCX API
            const response = await fetch('https://api.coindcx.com/exchange/ticker');
            const data = await response.json();
            this.processData(data);
            this.updateTable();
        } catch (error) {
            console.error('Error fetching data:', error);
            const tbody = document.getElementById('tickerBody');
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error fetching data. Please try again later.</td></tr>`;
        }
    }

    processData(data) {
        this.data = [];
        let srNo = 1;
        const usdtPairs = new Map();
        const inrPairs = new Map();

        // First pass: collect all pairs
        data.forEach(ticker => {
            if (ticker.market.endsWith('USDT')) {
                usdtPairs.set(ticker.market.replace('USDT', ''), ticker);
            } else if (ticker.market.endsWith('INR')) {
                inrPairs.set(ticker.market.replace('INR', ''), ticker);
            }
        });

        // Second pass: only process pairs that exist in both markets
        inrPairs.forEach((inrTicker, baseSymbol) => {
            const usdtTicker = usdtPairs.get(baseSymbol);
            if (usdtTicker) {
                const item = {
                    srNo: srNo++,
                    pair: inrTicker.market,
                    inrBid: parseFloat(inrTicker.bid || 0),
                    inrAsk: parseFloat(inrTicker.ask || 0),
                    inrVolume: parseFloat(inrTicker.volume || 0),
                    usdtBid: parseFloat(usdtTicker.bid || 0),
                    usdtAsk: parseFloat(usdtTicker.ask || 0),
                    lastUpdated: new Date(inrTicker.timestamp * 1000).toLocaleTimeString()
                };

                // Only add pairs that have valid price data
                if ((item.inrBid > 0 || item.inrAsk > 0) && (item.usdtBid > 0 || item.usdtAsk > 0)) {
                    // Calculate ranges
                    const calculatedItem = this.calculateRanges(item);
                    this.data.push(calculatedItem);
                }
            }
        });
    }

    calculateRanges(data) {
        // Buy Range: INR Ask / USDT Ask
        data.buyRange = (data.inrAsk / data.usdtAsk).toFixed(2);
        
        // Sell Range: INR Bid / USDT Bid
        data.sellRange = (data.inrBid / data.usdtBid).toFixed(2);
        
        return data;
    }

    handleSort(header) {
        const column = this.getColumnName(header.textContent.trim());
        
        if (this.currentSort.column === column) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.column = column;
            this.currentSort.direction = 'asc';
        }

        // Remove existing sort classes
        document.querySelectorAll('.sortable').forEach(el => {
            el.classList.remove('sorted-asc', 'sorted-desc');
        });

        // Add sort class to current header
        header.classList.add(`sorted-${this.currentSort.direction}`);

        this.updateTable();
    }

    getColumnName(headerText) {
        const columnMap = {
            'INR Bid': 'inrBid',
            'INR Ask': 'inrAsk',
            'Volume': 'inrVolume',
            'Buy Range': 'buyRange',
            'Sell Range': 'sellRange'
        };
        return columnMap[headerText.replace(' ↑↓', '')] || headerText.toLowerCase();
    }

    sortData() {
        if (!this.currentSort.column) return this.data;

        return [...this.data].sort((a, b) => {
            let aVal = a[this.currentSort.column];
            let bVal = b[this.currentSort.column];

            // Convert to numbers for numeric comparison
            if (!isNaN(aVal)) {
                aVal = Number(aVal);
                bVal = Number(bVal);
            }

            if (this.currentSort.direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }

    updateTable() {
        const tbody = document.getElementById('tickerBody');
        const sortedData = this.sortData();
        
        if (sortedData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center">No active trading pairs found</td></tr>`;
            return;
        }

        tbody.innerHTML = sortedData.map(item => `
            <tr>
                <td>${item.srNo}</td>
                <td>${item.pair}</td>
                <td>${item.inrBid.toFixed(4)}</td>
                <td>${item.inrAsk.toFixed(4)}</td>
                <td>${item.inrVolume.toFixed(4)}</td>
                <td>${item.buyRange}</td>
                <td>${item.sellRange}</td>
            </tr>
        `).join('');

        // Add last updated timestamp and pair count
        const timestamp = document.createElement('div');
        timestamp.className = 'text-muted small mt-2';
        timestamp.innerHTML = `
            Last updated: ${new Date().toLocaleString()}<br>
            Active pairs: ${sortedData.length}<br>
            <small class="text-info">
                Showing pairs available in both INR and USDT markets<br>
                Buy Range = INR Ask / USDT Ask<br>
                Sell Range = INR Bid / USDT Bid
            </small>
        `;
        
        // Remove any existing timestamp
        const existingTimestamp = tbody.parentElement.parentElement.querySelector('.text-muted');
        if (existingTimestamp) {
            existingTimestamp.remove();
        }
        
        tbody.parentElement.parentElement.appendChild(timestamp);
    }
}

// Initialize the ticker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CryptoTicker();
}); 