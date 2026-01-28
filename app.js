const { createApp } = Vue;

createApp({
    data() {
        return {
            // 👇 TU URL SIGUE AQUÍ 👇
            urlScript: "https://script.google.com/macros/s/AKfycbyn_8HetpmdgrBRPB2ftX8w3T97Te9nJCvl9VdKeupOgvZcKsWpGR2WmKds3epo0hFj6Q/exec", 
            
            productos: [],
            busqueda: '',
            categoriaActiva: 'Inicio',
            cargando: true,
            error: false,
            seleccionado: null,
            imgSeleccionada: '' // <--- NUEVO: Para saber qué foto estamos viendo en el modal
        }
    },
    computed: {
        categoriasUnicas() {
            const cats = new Set(this.productos.map(p => p.categoria).filter(c => c));
            return Array.from(cats).sort();
        },
        productosFiltrados() {
            let lista = this.productos;
            if (this.categoriaActiva !== 'Todas' && this.categoriaActiva !== 'Inicio') {
                lista = lista.filter(p => p.categoria === this.categoriaActiva);
            }
            const texto = this.busqueda.toLowerCase();
            if (texto) {
                lista = lista.filter(p => 
                    (p.nombre || '').toLowerCase().includes(texto) || 
                    (p.sku || '').toLowerCase().includes(texto) ||
                    (p.categoria || '').toLowerCase().includes(texto)
                );
            }
            return lista;
        },
        productosDestacados() {
            return this.productos.filter(p => p.destacado === 'SI');
        },
        linkWa() {
            if (!this.seleccionado) return '#';
            const msj = `Hola ROEMI 🎈, me interesa: ${this.seleccionado.nombre} (SKU: ${this.seleccionado.sku})`;
            return `https://wa.me/525512345678?text=${encodeURIComponent(msj)}`;
        }
    },
    methods: {
        async cargar() {
            try {
                if (!this.urlScript || this.urlScript.includes("TU_URL")) {
                    alert("Falta la URL en app.js"); this.error = true; return;
                }
                const res = await fetch(this.urlScript);
                if (!res.ok) throw new Error("Error");
                const datos = await res.json();
                this.productos = datos;
            } catch (e) {
                console.error(e); this.error = true;
            } finally {
                this.cargando = false;
            }
        },
        
        // --- CAMBIO IMPORTANTE AQUÍ ---
        verProducto(p) {
            this.seleccionado = p;
            // Al abrir, ponemos la primera foto como la seleccionada
            this.imgSeleccionada = this.obtenerListaFotos(p.imagen)[0]; 
        },

        moverCarrusel(direccion) {
            const track = this.$refs.track;
            if(track) track.scrollBy({ left: direccion * 280, behavior: 'smooth' });
        },

        // --- FUNCIÓN 1: SOLO LA PORTADA (Para el grid) ---
        obtenerPortada(imgRaw) {
            if (!imgRaw) return 'https://via.placeholder.com/300?text=ROEMI';
            let url = String(imgRaw).split(',')[0].trim();
            return url.startsWith('http') ? url : 'https://via.placeholder.com/300?text=ROEMI';
        },

        // --- FUNCIÓN 2: LISTA DE TODAS LAS FOTOS (Para la galería) ---
        obtenerListaFotos(imgRaw) {
            if (!imgRaw) return ['https://via.placeholder.com/400?text=ROEMI'];
            // Separa por comas, limpia espacios y filtra vacíos
            return String(imgRaw).split(',').map(u => u.trim()).filter(u => u.startsWith('http'));
        }
    },
    mounted() { this.cargar(); }
}).mount('#app');