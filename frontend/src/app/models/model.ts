import { signal } from '@angular/core';

const API_BASE = 'https://horizon-backend.onrender.com';

export class Model {
  private currentPage = signal('login');
  private isLoggedIn = signal(false);

  async login(email: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        this.isLoggedIn.set(true);
        this.currentPage.set('dashboard');
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.detail || 'Credenciales incorrectas' };
      }
    } catch (error) {
      console.error('Error in login:', error);
      return { success: false, message: 'No se pudo conectar con el servidor' };
    }
  }

  logout(): void {
    this.isLoggedIn.set(false);
    this.currentPage.set('login');
  }

  setCurrentPage(page: string): boolean {
    if (this.isLoggedIn()) {
      this.currentPage.set(page);
      return true;
    }
    return false;
  }

  // Operadores
  async getOperadores(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE}/api/operadores/`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching operadores:', error);
      return [];
    }
  }

  async createOperador(data: any): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/api/operadores/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.ok;
    } catch (error) {
      console.error('Error creating operador:', error);
      return false;
    }
  }

  async updateOperador(id: number, data: any): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/api/operadores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.ok;
    } catch (error) {
      console.error('Error updating operador:', error);
      return false;
    }
  }

  async deleteOperador(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/api/operadores/${id}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting operador:', error);
      return false;
    }
  }

  // Servicios
  async getServicios(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE}/api/servicios/`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching servicios:', error);
      return [];
    }
  }

  async createServicio(data: any): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/api/servicios/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.ok;
    } catch (error) {
      console.error('Error creating servicio:', error);
      return false;
    }
  }

  async updateServicio(id: number, data: any): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/api/servicios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.ok;
    } catch (error) {
      console.error('Error updating servicio:', error);
      return false;
    }
  }

  async deleteServicio(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/api/servicios/${id}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting servicio:', error);
      return false;
    }
  }

  // Reservas
  async getReservas(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE}/api/reservas/`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching reservas:', error);
      return [];
    }
  }

  async createReserva(data: any): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/api/reservas/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.ok;
    } catch (error) {
      console.error('Error creating reserva:', error);
      return false;
    }
  }

  async updateReserva(id: number, data: any): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/api/reservas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.ok;
    } catch (error) {
      console.error('Error updating reserva:', error);
      return false;
    }
  }

  async deleteReserva(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/api/reservas/${id}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting reserva:', error);
      return false;
    }
  }

  // Reclamaciones
  async getReclamaciones(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE}/api/reclamos/`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching reclamaciones:', error);
      return [];
    }
  }

  async resolveReclamacion(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/api/reclamos/${id}/resolve`, {
        method: 'PUT'
      });
      return response.ok;
    } catch (error) {
      console.error('Error resolving reclamacion:', error);
      return false;
    }
  }

  // Feedback
  async getFeedback(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE}/api/feedback/`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return [];
    }
  }

  getState() {
    return {
      currentPage: this.currentPage(),
      isLoggedIn: this.isLoggedIn()
    };
  }
}
