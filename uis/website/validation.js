document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('partnerForm');
    const successMessage = document.getElementById('successMessage');
    const submitBtn = form.querySelector('button[type="submit"]');
    const resetBtn = document.getElementById('resetBtn');
    
    // 1. Configuración de reglas de validación
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
        email: {
            element: document.getElementById('email'),
            errorElement: document.getElementById('emailError'),
            // Regex para validar formato estándar de correo
            validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        },
        phone: {
            element: document.getElementById('phone'),
            errorElement: document.getElementById('phoneError'),
            // Permite estar vacío o contener entre 7 y 15 caracteres (números, espacios y el signo +)
            validate: (value) => value.trim() === '' || /^[\d\s+]{7,15}$/.test(value)
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
        }
    };

    // 2. Función genérica de validación visual
    const validateField = (fieldName) => {
        const field = fields[fieldName];
        const isValid = field.validate(field.element.value);
        
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

    // 3. Listeners para validación en tiempo real (UX)
    Object.keys(fields).forEach(key => {
        fields[key].element.addEventListener('blur', () => validateField(key));
        fields[key].element.addEventListener('input', () => {
            if (fields[key].element.classList.contains('input-error')) {
                validateField(key);
            }
        });
    });

    // 4. Limpiar formulario y errores
    resetBtn.addEventListener('click', () => {
        Object.keys(fields).forEach(key => {
            fields[key].element.classList.remove('input-error', 'focus:ring-red-500', 'focus:border-red-500');
            fields[key].element.classList.add('focus:ring-[#FF6A00]', 'focus:border-[#FF6A00]');
            fields[key].errorElement.classList.remove('visible');
        });
    });

    // 5. Manejo del Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        let formIsValid = true;
        
        // Verificar todos los campos antes de enviar
        Object.keys(fields).forEach(key => {
            if (!validateField(key)) {
                formIsValid = false;
            }
        });

        if (formIsValid) {
            // --- ESTADO DE CARGA (LOADING) ---
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-70', 'cursor-not-allowed');
            submitBtn.innerHTML = `
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
            `;

            // --- RECOLECCIÓN DE DATOS (JSON READY) ---
            const formData = new FormData(form);
            const dataToSubmit = {
                fullName: formData.get('fullName'),
                companyName: formData.get('companyName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                targetMarket: formData.get('targetMarket'),
                monthlyVolume: parseInt(formData.get('monthlyVolume')),
                services: formData.getAll('services') // Recoge todos los checkboxes marcados en un array
            };

            // Imprimimos el objeto en consola para que veas cómo queda estructurado
            console.log("Datos listos para enviar al backend:", dataToSubmit);

            // Simulación de petición al servidor (1.5 segundos)
            setTimeout(() => {
                form.style.opacity = '0';
                form.style.transition = 'opacity 0.4s ease';
                
                setTimeout(() => {
                    form.style.display = 'none';
                    // Revertir botón a su estado original por si el usuario recarga
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
                    submitBtn.innerHTML = originalBtnText;
                    
                    // Mostrar mensaje de éxito
                    successMessage.classList.remove('hidden');
                    successMessage.classList.add('flex'); 
                }, 400);
            }, 1500);
        }
    });
});