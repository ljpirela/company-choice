document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('partnerForm');
    const successMessage = document.getElementById('successMessage');
    const submitBtn = form.querySelector('button[type="submit"]');
    const resetBtn = document.getElementById('resetBtn');
    const lowVolumeWarning = document.getElementById('lowVolumeWarning');
    const monthlyVolumeInput = document.getElementById('monthlyVolume');

    // Alerta dinámica de volúmenes bajos
    monthlyVolumeInput.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        if (value > 0 && value < 1000) {
            lowVolumeWarning.classList.remove('hidden');
        } else {
            lowVolumeWarning.classList.add('hidden');
        }
    });

    const fields = {
        fullName: {
            element: document.getElementById('fullName'),
            errorElement: document.getElementById('fullNameError'),
            validate: (value) => value.trim().length > 2
        },
        companyName: {
            element: document.getElementById('companyName'),
            errorElement: document.getElementById('companyNameError'),
            validate: (value) => value.trim().length > 1
        },
        website: {
            element: document.getElementById('website'),
            errorElement: document.getElementById('websiteError'),
            validate: (value) => /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(value)
        },
        product: {
            element: document.getElementById('product'),
            errorElement: document.getElementById('productError'),
            validate: (value) => value.trim().length > 1
        },
        email: {
            element: document.getElementById('email'),
            errorElement: document.getElementById('emailError'),
            validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        },
        phone: {
            element: document.getElementById('phone'),
            errorElement: document.getElementById('phoneError'),
            // Validación estricta obligatoria para el teléfono
            validate: (value) => /^[\d\s+]{7,15}$/.test(value.trim())
        },
        targetMarket: {
            element: document.getElementById('targetMarket'),
            errorElement: document.getElementById('targetMarketError'),
            validate: (value) => value !== ''
        },
        monthlyVolume: {
            element: document.getElementById('monthlyVolume'),
            errorElement: document.getElementById('monthlyVolumeError'),
            validate: (value) => !isNaN(value) && parseInt(value) > 0
        },
        privacy: {
            element: document.getElementById('privacy'),
            errorElement: document.getElementById('privacyError'),
            validate: (value, el) => el.checked
        }
    };

    const validateField = (fieldName) => {
        const field = fields[fieldName];
        const isValid = field.validate(field.element.value, field.element);
        
        if (!isValid) {
            field.element.classList.add('input-error', 'focus:ring-red-500', 'focus:border-red-500');
            field.element.classList.remove('focus:ring-[#FF6A00]', 'focus:border-[#FF6A00]');
            field.errorElement.classList.add('visible');
        } else {
            field.element.classList.remove('input-error', 'focus:ring-red-500', 'focus:border-red-500');
            field.element.classList.add('focus:ring-[#FF6A00]', 'focus:border-[#FF6A00]');
            field.errorElement.classList.remove('visible');
        }
        return isValid;
    };

    // Validación especial para grupo de checkboxes (Servicios)
    const validateServices = () => {
        const checkboxes = document.querySelectorAll('input[name="services"]');
        const isChecked = Array.from(checkboxes).some(cb => cb.checked);
        const errorSpan = document.getElementById('servicesError');
        
        if (!isChecked) {
            errorSpan.classList.add('visible');
            return false;
        } else {
            errorSpan.classList.remove('visible');
            return true;
        }
    };

    Object.keys(fields).forEach(key => {
        fields[key].element.addEventListener('blur', () => validateField(key));
        fields[key].element.addEventListener('input', () => {
            if (fields[key].element.classList.contains('input-error')) {
                validateField(key);
            }
        });
    });

    // Validar servicios al cambiar cualquier checkbox
    document.querySelectorAll('input[name="services"]').forEach(cb => {
        cb.addEventListener('change', () => {
            if (document.getElementById('servicesError').classList.contains('visible')) {
                validateServices();
            }
        });
    });

    resetBtn.addEventListener('click', () => {
        Object.keys(fields).forEach(key => {
            fields[key].element.classList.remove('input-error', 'focus:ring-red-500', 'focus:border-red-500');
            fields[key].element.classList.add('focus:ring-[#FF6A00]', 'focus:border-[#FF6A00]');
            fields[key].errorElement.classList.remove('visible');
        });
        document.getElementById('servicesError').classList.remove('visible');
        lowVolumeWarning.classList.add('hidden');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        let formIsValid = true;
        
        Object.keys(fields).forEach(key => {
            if (!validateField(key)) formIsValid = false;
        });

        if (!validateServices()) formIsValid = false;

        if (formIsValid) {
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Procesando...';

            setTimeout(() => {
                form.style.display = 'none';
                successMessage.classList.remove('hidden');
                successMessage.classList.add('flex'); 
            }, 1000);
        }
    });
});