// Google Sheets Integration for Al Marsam
class BookingSystem {
  constructor() {
    this.bookingApiBase = 'http://localhost:3003/api';
    this.emailApiBase = 'http://localhost:3005';
    this.init();
  }

  init() {
    this.setupForms();
    this.loadStoredOrders();
  }

  setupForms() {
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
    }

    // Booking form
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
      bookingForm.addEventListener('submit', (e) => this.handleBookingForm(e));
    }

    // Checkout form
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => this.handleCheckoutForm(e));
    }
  }

  async handleContactForm(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const contactData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
      subject: formData.get('subject'),
      language: currentLang || 'en'
    };

    try {
      this.showLoading(form);
      
      // Send to Google Sheets API
      const sheetsResponse = await fetch(`${this.bookingApiBase}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData)
      });

      const sheetsResult = await sheetsResponse.json();
      
      // Send email notification
      const emailResponse = await fetch(`${this.emailApiBase}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData)
      });

      const emailResult = await emailResponse.json();
      
      if (sheetsResult.success && emailResult.success) {
        this.showSuccess(form, currentLang === 'ar' ? 'تم إرسال الرسالة بنجاح!' : 'Message sent successfully!');
        form.reset();
      } else {
        this.showError(form, 
          currentLang === 'ar' ? 'فشل إرسال الرسالة' : 'Failed to send message'
        );
      }
    } catch (error) {
      console.error('Contact form error:', error);
      this.showError(form, 
        currentLang === 'ar' ? 'خطأ في الشبكة. حاول مرة أخرى.' : 'Network error. Please try again.'
      );
    } finally {
      this.hideLoading(form);
    }
  }

  async handleBookingForm(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const bookingData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      service: formData.get('service'),
      date: formData.get('date'),
      time: formData.get('time'),
      notes: formData.get('notes'),
      language: currentLang || 'en'
    };

    try {
      this.showLoading(form);
      
      const response = await fetch(`${this.apiBase}/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();
      
      if (result.success) {
        this.showSuccess(form, 'Booking created successfully! We will contact you soon.');
        form.reset();
        
        // Store booking locally
        this.storeBooking(result.bookingId, bookingData);
      } else {
        this.showError(form, result.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking form error:', error);
      this.showError(form, 'Network error. Please try again.');
    } finally {
      this.hideLoading(form);
    }
  }

  async handleCheckoutForm(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const customerInfo = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      city: formData.get('city'),
      country: formData.get('country')
    };

    // Get cart items from shopData or localStorage
    const cartItems = this.getCartItems();
    
    if (cartItems.length === 0) {
      this.showError(form, 'Your cart is empty');
      return;
    }

    const orderData = {
      customerInfo,
      items: cartItems,
      total: this.calculateTotal(cartItems),
      language: currentLang || 'en'
    };

    try {
      this.showLoading(form);
      
      const response = await fetch(`${this.apiBase}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      
      if (result.success) {
        this.showSuccess(form, 'Order placed successfully! We will contact you soon.');
        
        // Clear cart
        if (typeof clearCart === 'function') {
          clearCart();
        }
        
        // Store order locally
        this.storeOrder(result.orderId, orderData);
        
        // Redirect to thank you page
        setTimeout(() => {
          window.location.href = 'thank-you.html';
        }, 2000);
      } else {
        this.showError(form, result.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      this.showError(form, 'Network error. Please try again.');
    } finally {
      this.hideLoading(form);
    }
  }

  getCartItems() {
    // Try to get from shopData (if on shop page)
    if (typeof shopData !== 'undefined' && shopData.cart) {
      return shopData.cart.map(item => {
        const product = shopData.products.find(p => p.id === item.productId);
        return {
          id: product.id,
          name: product.title,
          nameAr: product.titleAr,
          category: product.category,
          price: product.price,
          quantity: item.quantity
        };
      });
    }
    
    // Fallback to localStorage
    const cart = JSON.parse(localStorage.getItem('almarsam_cart') || '[]');
    return cart;
  }

  calculateTotal(items) {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  storeBooking(id, data) {
    const bookings = JSON.parse(localStorage.getItem('almarsam_bookings') || '[]');
    bookings.push({ id, data, createdAt: new Date().toISOString() });
    localStorage.setItem('almarsam_bookings', JSON.stringify(bookings));
  }

  storeOrder(id, data) {
    const orders = JSON.parse(localStorage.getItem('almarsam_orders') || '[]');
    orders.push({ id, data, createdAt: new Date().toISOString() });
    localStorage.setItem('almarsam_orders', JSON.stringify(orders));
  }

  loadStoredOrders() {
    // Display user's previous orders if needed
    const orders = JSON.parse(localStorage.getItem('almarsam_orders') || '[]');
    const bookings = JSON.parse(localStorage.getItem('almarsam_bookings') || '[]');
    
    console.log('Loaded orders:', orders);
    console.log('Loaded bookings:', bookings);
  }

  showLoading(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      const originalText = submitBtn.textContent;
      submitBtn.setAttribute('data-original-text', originalText);
      submitBtn.innerHTML = `
        <span class="loading-spinner"></span>
        ${currentLang === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
      `;
    }
  }

  hideLoading(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      const originalText = submitBtn.getAttribute('data-original-text');
      if (originalText) {
        submitBtn.innerHTML = originalText;
      }
    }
  }

  showSuccess(form, message) {
    this.showAlert(form, message, 'success');
  }

  showError(form, message) {
    this.showAlert(form, message, 'error');
  }

  showAlert(form, message, type) {
    // Remove existing alerts
    const existingAlert = form.querySelector('.form-alert');
    if (existingAlert) {
      existingAlert.remove();
    }

    const alert = document.createElement('div');
    alert.className = `form-alert ${type}`;
    alert.textContent = message;
    
    form.insertBefore(alert, form.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove();
      }
    }, 5000);
  }

  // Export data to Excel
  async exportData(type) {
    try {
      const response = await fetch(`${this.apiBase}/export/${type}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `almarsam-${type}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  }
}

// Initialize booking system
let bookingSystem;
document.addEventListener('DOMContentLoaded', () => {
  bookingSystem = new BookingSystem();
});

// Export for global access
window.bookingSystem = bookingSystem;
window.exportData = (type) => bookingSystem.exportData(type);

// Contact page translations
if (document.getElementById('contactForm')) {
  const contactTranslations = {
    en: {
      contactTitle: "Contact Al Marsam",
      contactHeroTitle: "Get in",
      touch: "Touch",
      contactHeroDescription: "Have questions about our workshops, want to commission artwork, or simply want to say hello? We'd love to hear from you!",
      contactInfo: "Contact Information",
      visitUs: "Visit Us",
      address: "Al Marsam Art Studio<br>Cairo, Egypt",
      emailUs: "Email Us",
      callUs: "Call Us",
      hours: "Opening Hours",
      hoursDetails: "Saturday - Thursday: 9:00 AM - 8:00 PM<br>Friday: 2:00 PM - 8:00 PM",
      sendMessage: "Send us a Message",
      yourName: "Your Name *",
      yourEmail: "Your Email *",
      yourPhone: "Your Phone",
      subject: "Subject",
      selectSubject: "Select a subject",
      workshopInquiry: "Workshop Inquiry",
      artCommission: "Art Commission",
      generalInquiry: "General Inquiry",
      feedback: "Feedback",
      yourMessage: "Your Message *",
      namePlaceholder: "Enter your name",
      emailPlaceholder: "Enter your email",
      phonePlaceholder: "Enter your phone number",
      messagePlaceholder: "Type your message here..."
    },
    ar: {
      contactTitle: "تواصل مع المرسم",
      contactHeroTitle: "تواصل مع",
      touch: "المرسم",
      contactHeroDescription: "لديك أسئلة حول ورش العمل، تريد تكليف فني، أو ببساطة تريد أن تقول مرحباً؟ نود أن نسمع منك!",
      contactInfo: "معلومات التواصل",
      visitUs: "زرنا",
      address: "استوديو المرسم الفني<br>القاهرة، مصر",
      emailUs: "راسلنا عبر الإيميل",
      callUs: "اتصل بنا",
      hours: "ساعات العمل",
      hoursDetails: "السبت - الخميس: 9:00 ص - 8:00 م<br>الجمعة: 2:00 م - 8:00 م",
      sendMessage: "أرسل لنا رسالة",
      yourName: "اسمك *",
      yourEmail: "إيميلك *",
      yourPhone: "رقم هاتفك",
      subject: "الموضوع",
      selectSubject: "اختر موضوعاً",
      workshopInquiry: "استفسار ورشة عمل",
      artCommission: "تكليف فني",
      generalInquiry: "استفسار عام",
      feedback: "ملاحظات",
      yourMessage: "رسالتك *",
      namePlaceholder: "أدخل اسمك",
      emailPlaceholder: "أدخل إيميلك",
      phonePlaceholder: "أدخل رقم هاتفك",
      messagePlaceholder: "اكتب رسالتك هنا..."
    }
  };

  // Update contact page translations
  document.querySelectorAll('[data-translate]').forEach(element => {
    const key = element.dataset.translate;
    const translation = contactTranslations[currentLang][key];
    if (translation) {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
    const key = element.dataset.translatePlaceholder;
    const translation = contactTranslations[currentLang][key];
    if (translation) {
      element.placeholder = translation;
    }
  });
}