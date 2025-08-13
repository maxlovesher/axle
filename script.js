document.addEventListener('DOMContentLoaded', function() {
    // Initialize local storage data if not exists
    if (!localStorage.getItem('vendorData')) {
        const initialData = {
            sales: {
                today: 0,
                productsSold: 0,
                salesHistory: []
            },
            inventory: [
                { id: '1', name: 'Organic Tomatoes', quantity: 120, incoming: 50 },
                { id: '2', name: 'Cucumbers', quantity: 85, incoming: 30 },
                { id: '3', name: 'Bell Peppers', quantity: 65, incoming: 20 },
                { id: '4', name: 'Carrots', quantity: 150, incoming: 0 },
                { id: '5', name: 'Potatoes', quantity: 200, incoming: 0 }
            ],
            orders: [
                { 
                    id: '1', 
                    vendor: 'Fresh Produce Co.', 
                    date: '2023-08-15', 
                    category: 'Vegetables', 
                    status: 'pending', 
                    expectedTime: '14:30',
                    items: [
                        { productId: '1', name: 'Organic Tomatoes', quantity: 50 },
                        { productId: '2', name: 'Cucumbers', quantity: 30 },
                        { productId: '3', name: 'Bell Peppers', quantity: 20 }
                    ]
                },
                { 
                    id: '2', 
                    vendor: 'Dairy Delight', 
                    date: '2023-08-16', 
                    category: 'Dairy', 
                    status: 'pending', 
                    expectedTime: '10:00',
                    items: [] 
                },
                { 
                    id: '3', 
                    vendor: 'Bakery Central', 
                    date: '2023-08-17', 
                    category: 'Bread', 
                    status: 'confirmed', 
                    expectedTime: '09:00',
                    items: [] 
                }
            ]
        };
        localStorage.setItem('vendorData', JSON.stringify(initialData));
    }

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    const currentTheme = localStorage.getItem('theme') || 
                        (prefersDarkScheme.matches ? 'dark' : 'light');
    
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
    });

    // Load data from local storage
    let vendorData = JSON.parse(localStorage.getItem('vendorData'));

    // Update sales summary
    updateSalesSummary(vendorData.sales);

    // Update inventory list
    updateInventoryList(vendorData.inventory, 'high');

    // Update orders list
    updateOrdersList(vendorData.orders);

    // Inventory sort change
    document.getElementById('inventory-sort').addEventListener('change', function() {
        updateInventoryList(vendorData.inventory, this.value);
    });

    // Modal Management
    const modals = {
        'dbms-modal': document.getElementById('dbms-modal'),
        'add-vendor-modal': document.getElementById('add-vendor-modal'),
        'add-product-modal': document.getElementById('add-product-modal')
    };

    // Open modal functions
    document.getElementById('dbms-button').addEventListener('click', function() {
        openModal('dbms-modal');
        updateDBMSTable(vendorData.inventory);
    });

    document.getElementById('add-product-btn').addEventListener('click', function() {
        openModal('add-product-modal');
    });

    document.getElementById('add-vendor-btn').addEventListener('click', function() {
        openModal('add-vendor-modal');
        document.getElementById('order-date').valueAsDate = new Date();
    });

    document.getElementById('view-all-orders').addEventListener('click', function() {
        showDetailsModal('orders', vendorData);
    });

    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            closeModal(modalId);
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        Object.keys(modals).forEach(modalId => {
            if (event.target === modals[modalId]) {
                closeModal(modalId);
            }
        });
    });

    // Modal helper functions
    function openModal(modalId) {
        modals[modalId].style.display = 'flex';
    }

    function closeModal(modalId) {
        modals[modalId].style.display = 'none';
    }

    // Add new product
    document.getElementById('add-product-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newProduct = {
            id: document.getElementById('new-product-id').value,
            name: document.getElementById('new-product-name').value,
            quantity: parseInt(document.getElementById('new-product-qty').value),
            incoming: parseInt(document.getElementById('new-product-incoming').value) || 0
        };
        
        vendorData.inventory.push(newProduct);
        localStorage.setItem('vendorData', JSON.stringify(vendorData));
        
        updateInventoryList(vendorData.inventory, document.getElementById('inventory-sort').value);
        updateDBMSTable(vendorData.inventory);
        
        this.reset();
        closeModal('add-product-modal');
    });

    // View details buttons
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', function() {
            const viewType = this.getAttribute('data-view');
            showDetailsModal(viewType, vendorData);
        });
    });

    // Add vendor order form
    document.getElementById('add-vendor-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get order items
        const items = [];
        document.querySelectorAll('.order-item-row').forEach(row => {
            const productSelect = row.querySelector('select');
            const quantityInput = row.querySelector('input[type="number"]');
            
            if (productSelect.value && quantityInput.value) {
                items.push({
                    productId: productSelect.value,
                    name: productSelect.options[productSelect.selectedIndex].text,
                    quantity: parseInt(quantityInput.value)
                });
            }
        });
        
        // Create new order
        const newOrder = {
            id: Date.now().toString(),
            vendor: document.getElementById('vendor-name').value,
            date: document.getElementById('order-date').value,
            category: document.getElementById('order-category').value,
            expectedTime: document.getElementById('expected-time').value,
            status: 'pending',
            items: items
        };
        
        vendorData.orders.push(newOrder);
        localStorage.setItem('vendorData', JSON.stringify(vendorData));
        
        updateOrdersList(vendorData.orders);
        this.reset();
        document.getElementById('order-items-container').innerHTML = '';
        closeModal('add-vendor-modal');
    });

    // Add item to vendor order
    document.getElementById('add-item-btn').addEventListener('click', function() {
        addOrderItemRow();
    });

    // Text Mode Toggle
    const textModeCheckbox = document.getElementById('text-mode-checkbox');
    const textInputMode = document.getElementById('text-input-mode');
    const responseArea = document.getElementById('response-area');

    textModeCheckbox.addEventListener('change', function() {
        if (this.checked) {
            textInputMode.style.display = 'block';
            responseArea.style.display = 'none';
        } else {
            textInputMode.style.display = 'none';
            responseArea.style.display = 'block';
        }
    });

    // Action Buttons
    document.querySelectorAll('.action-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.action-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // Submit button for manual input
    document.getElementById('submit-btn').addEventListener('click', function() {
        const productSelect = document.getElementById('product-select');
        const quantity = parseInt(document.getElementById('quantity').value);
        const action = document.querySelector('.action-btn.active').dataset.action;
        
        if (!productSelect.value) {
            alert('Please select a product');
            return;
        }
        
        if (!quantity || quantity < 1) {
            alert('Please enter a valid quantity');
            return;
        }
        
        const productName = productSelect.options[productSelect.selectedIndex].text;
        const productId = productSelect.value;
        const qtyChange = action === 'add' ? quantity : -quantity;
        
        // Update the data
        const vendorData = JSON.parse(localStorage.getItem('vendorData'));
        const productIndex = vendorData.inventory.findIndex(item => item.id === productId);
        
        if (productIndex !== -1) {
            // Update inventory
            vendorData.inventory[productIndex].quantity += qtyChange;
            if (vendorData.inventory[productIndex].quantity < 0) {
                vendorData.inventory[productIndex].quantity = 0;
            }
            
            // Update sales if it's a removal
            if (action === 'remove') {
                vendorData.sales.today += quantity * 10; // Assuming $10 per item
                vendorData.sales.productsSold += quantity;
                vendorData.sales.salesHistory.push({
                    productId,
                    name: productName,
                    quantity: quantity,
                    price: 10,
                    total: quantity * 10
                });
            }
            
            // Save updated data
            localStorage.setItem('vendorData', JSON.stringify(vendorData));
            
            // Update UI
            updateInventoryList(vendorData.inventory, document.getElementById('inventory-sort').value);
            updateSalesSummary(vendorData.sales);
            updateDBMSTable(vendorData.inventory);
            
            // Show confirmation
            const message = `${action === 'add' ? 'Added' : 'Removed'} ${quantity} ${productName}`;
            responseArea.innerHTML = `<p>${message}</p>`;
        }
        
        // Reset form
        productSelect.value = '';
        document.getElementById('quantity').value = '1';
        document.querySelector('.action-btn[data-action="add"]').classList.add('active');
        document.querySelector('.action-btn[data-action="remove"]').classList.remove('active');
        
        // Switch back to voice mode
        textModeCheckbox.checked = false;
        textInputMode.style.display = 'none';
        responseArea.style.display = 'block';
    });

    // Mic Button Functionality
    document.getElementById('mic-button').addEventListener('click', function() {
        // Simulate voice recognition
        responseArea.innerHTML = '<p>Listening... <span class="pulsing-dots"></span></p>';
        
        // Simulate response after delay
        setTimeout(() => {
            const vendorData = JSON.parse(localStorage.getItem('vendorData'));
            responseArea.innerHTML = `
                <p>Order status for Fresh Produce Co.:</p>
                <ul>
                    <li>50 cases tomatoes</li>
                    <li>30 cases cucumbers</li>
                    <li>20 cases bell peppers</li>
                </ul>
                <p class="status-text">Status: Pending</p>
                <p>Inventory summary:</p>
                <ul>
                    ${vendorData.inventory.slice(0, 3).map(item => 
                        `<li>${item.quantity} ${item.name}</li>`
                    ).join('')}
                </ul>
            `;
        }, 2000);
    });

    // Helper function to add order item rows
    function addOrderItemRow(productId = '', quantity = 1) {
        const vendorData = JSON.parse(localStorage.getItem('vendorData'));
        const row = document.createElement('div');
        row.className = 'order-item-row';
        
        const select = document.createElement('select');
        select.className = 'form-select';
        select.required = true;
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a product';
        select.appendChild(defaultOption);
        
        // Add product options
        vendorData.inventory.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            if (product.id === productId) option.selected = true;
            select.appendChild(option);
        });
        
        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.min = '1';
        quantityInput.value = quantity;
        quantityInput.required = true;
        quantityInput.className = 'form-input';
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-item-btn';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', function() {
            row.remove();
        });
        
        row.appendChild(select);
        row.appendChild(quantityInput);
        row.appendChild(removeBtn);
        document.getElementById('order-items-container').appendChild(row);
    }

    // Functions
    function updateSalesSummary(salesData) {
        document.getElementById('gross-sales').textContent = `$${salesData.today.toLocaleString()}`;
        document.getElementById('products-sold').textContent = salesData.productsSold;
    }

    function updateInventoryList(inventory, sortOrder) {
        const inventoryList = document.getElementById('inventory-list');
        inventoryList.innerHTML = '';
        
        // Sort inventory
        const sortedInventory = [...inventory].sort((a, b) => {
            return sortOrder === 'high' ? b.quantity - a.quantity : a.quantity - b.quantity;
        });
        
        // Display top 5
        const displayCount = Math.min(5, sortedInventory.length);
        for (let i = 0; i < displayCount; i++) {
            const item = sortedInventory[i];
            const inventoryItem = document.createElement('div');
            inventoryItem.className = 'inventory-item';
            inventoryItem.innerHTML = `
                <div class="inventory-info">
                    <h4>${item.name}</h4>
                    <p>Product ID: ${item.id}</p>
                </div>
                <span class="inventory-qty">${item.quantity} units</span>
            `;
            inventoryList.appendChild(inventoryItem);
        }
    }

    function updateOrdersList(orders) {
        const orderList = document.getElementById('order-list');
        orderList.innerHTML = '';
        
        // Display only pending orders in main view
        const pendingOrders = orders.filter(order => order.status === 'pending');
        const displayCount = Math.min(3, pendingOrders.length);
        
        for (let i = 0; i < displayCount; i++) {
            const order = pendingOrders[i];
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.innerHTML = `
                <div class="order-info">
                    <h4>${order.vendor}</h4>
                    <p>${formatDate(order.date)} • ${order.category}</p>
                    ${order.expectedTime ? `<p>Expected: ${formatTime(order.expectedTime)}</p>` : ''}
                </div>
                <span class="order-status ${order.status}">${order.status}</span>
            `;
            orderList.appendChild(orderItem);
        }
    }

    function updateDBMSTable(inventory) {
        const tableBody = document.getElementById('dbms-table-body');
        tableBody.innerHTML = '';
        
        inventory.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td><input type="number" class="qty-input" value="${item.quantity}" min="0" data-id="${item.id}" data-field="quantity"></td>
                <td><input type="number" class="incoming-input" value="${item.incoming}" min="0" data-id="${item.id}" data-field="incoming"></td>
                <td class="action-btns">
                    <button class="action-btn delete-btn" data-id="${item.id}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Add event listeners for quantity changes
        document.querySelectorAll('.qty-input, .incoming-input').forEach(input => {
            input.addEventListener('change', function() {
                const id = this.getAttribute('data-id');
                const field = this.getAttribute('data-field');
                const value = parseInt(this.value) || 0;
                
                const itemIndex = vendorData.inventory.findIndex(item => item.id === id);
                if (itemIndex !== -1) {
                    vendorData.inventory[itemIndex][field] = value;
                    localStorage.setItem('vendorData', JSON.stringify(vendorData));
                    updateInventoryList(vendorData.inventory, document.getElementById('inventory-sort').value);
                }
            });
        });
        
        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this product?')) {
                    vendorData.inventory = vendorData.inventory.filter(item => item.id !== id);
                    localStorage.setItem('vendorData', JSON.stringify(vendorData));
                    updateDBMSTable(vendorData.inventory);
                    updateInventoryList(vendorData.inventory, document.getElementById('inventory-sort').value);
                }
            });
        });
    }

    function showDetailsModal(type, data) {
        // Create a modal for details
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        let modalContent = '';
        let title = '';
        
        if (type === 'sales') {
            title = 'Today\'s Sales Details';
            modalContent = `
                <div class="sales-details">
                    <h4>Total Sales: $${data.sales.today.toLocaleString()}</h4>
                    <p>Products Sold: ${data.sales.productsSold}</p>
                    <div class="sales-items">
                        <h5>Itemized Sales:</h5>
                        ${data.sales.salesHistory.length > 0 ? 
                            data.sales.salesHistory.map(item => `
                                <div class="sales-item">
                                    <span>${item.name}</span>
                                    <span>${item.quantity} x $${item.price} = $${item.total}</span>
                                </div>
                            `).join('') : 
                            '<p>No sales recorded today</p>'}
                    </div>
                </div>
            `;
        } else if (type === 'products') {
            title = 'Products Sold Today';
            modalContent = `
                <div class="sales-details">
                    <p>Total products sold: ${data.sales.productsSold}</p>
                    <div class="sales-items">
                        ${data.sales.salesHistory.length > 0 ? 
                            data.sales.salesHistory.map(item => `
                                <div class="sales-item">
                                    <span>${item.name}</span>
                                    <span>${item.quantity} units</span>
                                </div>
                            `).join('') : 
                            '<p>No products sold today</p>'}
                    </div>
                </div>
            `;
        } else if (type === 'orders') {
            title = 'All Vendor Orders';
            modalContent = `
                <div class="order-details">
                    ${data.orders.map(order => `
                        <div class="order-item">
                            <div class="order-info">
                                <h4>${order.vendor}</h4>
                                <p>${formatDate(order.date)} • ${order.category}</p>
                                ${order.items.length > 0 ? `
                                    <div class="order-items">
                                        ${order.items.map(item => `
                                            <div class="order-item-detail">
                                                <span>${item.name}</span>
                                                <span>${item.quantity} units</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                            <span class="order-status ${order.status}">${order.status}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close-modal" data-modal="dynamic-modal">&times;</button>
                </div>
                <div class="modal-body">
                    ${modalContent}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add close functionality
        modal.querySelector('.close-modal').addEventListener('click', function() {
            modal.style.display = 'none';
            setTimeout(() => modal.remove(), 300);
        });
        
        // Close when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                setTimeout(() => modal.remove(), 300);
            }
        });
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function formatTime(timeString) {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }
});