<template>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <h2>{{ isLogin ? 'Iniciar Sesión' : 'Crear Cuenta' }}</h2>
                <p class="subtitle">{{ isLogin ? 'Gestiona tus mecanismos y planos de vivienda' : 'Empieza gratis hoy mismo' }}</p>
            </div>
            
            <form @submit.prevent="handleSubmit" class="auth-form">
                <div class="form-group" v-if="!isLogin">
                    <label>Nombre Completo</label>
                    <input type="text" v-model="fullName" placeholder="Ej. Juan Pérez" required />
                </div>

                <div class="form-group">
                    <label>Correo Electrónico</label>
                    <input type="email" v-model="email" placeholder="ejemplo@correo.com" required />
                </div>

                <div class="form-group">
                    <label>Contraseña</label>
                    <input type="password" v-model="password" placeholder="••••••••" required />
                </div>

                <div class="form-group" v-if="!isLogin">
                    <label>Empresa (Opcional)</label>
                    <input type="text" v-model="empresa" placeholder="Ej. Instalaciones S.A." />
                </div>

                <p v-if="error" class="error-msg">{{ error }}</p>
                <p v-if="success" class="success-msg">{{ success }}</p>

                <button type="submit" class="btn-auth" :disabled="loading">
                    {{ loading ? 'Procesando...' : (isLogin ? 'Acceder' : 'Registrarse') }}
                </button>
            </form>

            <div class="auth-footer">
                <p>
                    {{ isLogin ? '¿No tienes cuenta?' : '¿Ya tienes una cuenta?' }}
                    <span @click="toggleMode" class="toggle-link">
                        {{ isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí' }}
                    </span>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "LoginView",
    data() {
        return {
            isLogin: true,
            email: "",
            password: "",
            fullName: "",
            empresa: "",
            error: "",
            success: "",
            loading: false
        };
    },
    methods: {
        toggleMode() {
            this.isLogin = !this.isLogin;
            this.error = "";
            this.success = "";
        },
        handleSubmit() {
            this.error = "";
            this.success = "";
            this.loading = true;

            const endpoint = this.isLogin ? "/login" : "/register";
            const payload = this.isLogin 
                ? { email: this.email, password: this.password }
                : { email: this.email, password: this.password, fullName: this.fullName, empresa: this.empresa };

            fetch(`${window.API_URL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })
            .then(async res => {
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Ocurrió un error inesperado.");
                }
                return data;
            })
            .then(data => {
                if (this.isLogin) {
                    // Emitir éxito con token y usuario
                    this.$emit("login-success", data);
                } else {
                    this.success = "¡Registro exitoso! Iniciando sesión...";
                    // Auto login después del registro
                    fetch(`${window.API_URL}/login`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ email: this.email, password: this.password })
                    })
                    .then(res => res.json())
                    .then(loginData => {
                        this.$emit("login-success", loginData);
                    })
                    .catch(() => {
                        this.isLogin = true;
                        this.success = "Registro exitoso. Inicia sesión por favor.";
                    });
                }
            })
            .catch(err => {
                this.error = err.message;
            })
            .finally(() => {
                this.loading = false;
            });
        }
    }
};
</script>

<style scoped>
.auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: radial-gradient(circle at top right, rgba(138, 191, 240, 0.4), transparent),
                radial-gradient(circle at bottom left, rgba(74, 151, 237, 0.15), transparent),
                #f7fafc;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    padding: 20px;
}

.auth-card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 24px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04),
                0 1px 8px rgba(0, 0, 0, 0.02);
    width: 100%;
    max-width: 420px;
    padding: 40px;
    box-sizing: border-box;
    transition: transform 0.3s ease;
}

.auth-header {
    text-align: center;
    margin-bottom: 30px;
}

.auth-header h2 {
    font-size: 2rem;
    font-weight: 800;
    color: #1a202c;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
}

.subtitle {
    font-size: 0.95rem;
    color: #718096;
    margin: 0;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: left;
}

.form-group label {
    font-size: 0.85rem;
    font-weight: 700;
    color: #4a5568;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.form-group input {
    padding: 12px 16px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    font-size: 0.95rem;
    color: #2d3748;
    outline: none;
    transition: all 0.25s ease;
}

.form-group input:focus {
    border-color: rgb(109, 180, 247);
    box-shadow: 0 0 0 4px rgba(109, 180, 247, 0.2);
    background-color: #ffffff;
}

.error-msg {
    color: #e53e3e;
    font-size: 0.85rem;
    margin: 0;
    font-weight: 600;
}

.success-msg {
    color: #38a169;
    font-size: 0.85rem;
    margin: 0;
    font-weight: 600;
}

.btn-auth {
    padding: 14px;
    background: linear-gradient(135deg, rgb(109, 180, 247), rgb(74, 151, 237));
    color: #ffffff;
    font-weight: 700;
    font-size: 1rem;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(74, 151, 237, 0.3);
    transition: all 0.2s ease;
}

.btn-auth:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(74, 151, 237, 0.45);
}

.btn-auth:disabled {
    background: #cbd5e0;
    box-shadow: none;
    cursor: not-allowed;
}

.auth-footer {
    text-align: center;
    margin-top: 24px;
    font-size: 0.9rem;
    color: #718096;
}

.toggle-link {
    color: rgb(74, 151, 237);
    font-weight: 700;
    cursor: pointer;
    transition: color 0.2s;
}

.toggle-link:hover {
    color: rgb(50, 120, 200);
    text-decoration: underline;
}

/* ===== MOBILE RESPONSIVE ===== */
@media (max-width: 640px) {
    .auth-container {
        padding: 16px;
        align-items: flex-start;
        padding-top: 10vh;
    }

    .auth-card {
        padding: 24px 20px;
        border-radius: 20px;
    }

    .auth-header {
        margin-bottom: 20px;
    }

    .auth-header h2 {
        font-size: 1.5rem;
    }

    .subtitle {
        font-size: 0.85rem;
    }

    .auth-form {
        gap: 16px;
    }

    .form-group input {
        padding: 10px 14px;
        font-size: 16px; /* prevents iOS zoom on focus */
    }

    .btn-auth {
        padding: 12px;
        font-size: 0.95rem;
    }

    .auth-footer {
        margin-top: 20px;
        font-size: 0.85rem;
    }
}
</style>
