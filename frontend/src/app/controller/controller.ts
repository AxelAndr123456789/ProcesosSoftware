import { Model } from '../models/model';
import { View } from '../views/view';

export class Controller {
  private model: Model;
  private view: View;

  constructor(model: Model, view: View) {
    this.model = model;
    this.view = view;

    this.view.bindLogin(this.handleLogin.bind(this));
    this.view.bindNavigation(this.handleNavigation.bind(this));
    this.view.bindLogout(this.handleLogout.bind(this));
    
    this.view.bindCreateOperador(this.handleCreateOperador.bind(this));
    this.view.bindCreateServicio(this.handleCreateServicio.bind(this));
    this.view.bindCreateReserva(this.handleCreateReserva.bind(this));
    
    this.view.bindUpdateOperador(this.handleUpdateOperador.bind(this));
    this.view.bindDeleteOperador(this.handleDeleteOperador.bind(this));
    
    this.view.bindUpdateServicio(this.handleUpdateServicio.bind(this));
    this.view.bindDeleteServicio(this.handleDeleteServicio.bind(this));
    
    this.view.bindUpdateReserva(this.handleUpdateReserva.bind(this));
    this.view.bindDeleteReserva(this.handleDeleteReserva.bind(this));
    this.view.bindResolveReclamo(this.handleResolveReclamo.bind(this));

    this.onStateChanged();
    this.loadInitialData();
  }

  private async loadInitialData(): Promise<void> {
    const operadores = await this.model.getOperadores();
    const servicios = await this.model.getServicios();
    const reservas = await this.model.getReservas();
    const reclamaciones = await this.model.getReclamaciones();
    const feedback = await this.model.getFeedback();
    
    this.view.renderOperadores(operadores);
    this.view.renderServicios(servicios);
    this.view.renderReservas(reservas);
    this.view.renderReclamaciones(reclamaciones);
    this.view.renderFeedback(feedback);
    this.view.refreshDashboardStats();
  }

  private onStateChanged(): void {
    this.view.render(this.model.getState());
  }

  private async handleLogin(email: string, password: string): Promise<void> {
    const result = await this.model.login(email, password);
    if (result.success) {
      this.view.showCustomModal('Bienvenido', 'Inicio de sesion exitoso.', 'success');
      this.onStateChanged();
    } else {
      this.view.showCustomModal('Error de autenticacion', result.message || 'Credenciales incorrectas. Por favor, intenta de nuevo.', 'error');
    }
  }

  private handleNavigation(pageId: string): void {
    const changed = this.model.setCurrentPage(pageId);
    if (changed) {
      this.onStateChanged();
    }
  }

  private handleLogout(): void {
    this.model.logout();
    this.onStateChanged();
  }

  private async handleCreateOperador(data: any): Promise<boolean> {
    const existing = await this.model.getOperadores();
    const duplicate = existing.find((op: any) =>
      op.contacto?.toLowerCase().trim() === data.contacto?.toLowerCase().trim()
    );
    if (duplicate) {
      this.view.showCustomModal('Dato duplicado', 'Ya existe un operador con ese nombre. Por favor, ingresa un nombre diferente.', 'error');
      return false;
    }
    const success = await this.model.createOperador(data);
    if (success) await this.loadInitialData();
    return success;
  }

  private async handleCreateServicio(data: any): Promise<boolean> {
    const existing = await this.model.getServicios();
    const duplicate = existing.find((svc: any) =>
      svc.nombre?.toLowerCase().trim() === data.nombre?.toLowerCase().trim() &&
      svc.destino?.toLowerCase().trim() === data.destino?.toLowerCase().trim()
    );
    if (duplicate) {
      this.view.showCustomModal('Dato duplicado', 'Ya existe un servicio con ese nombre y destino. Por favor, modifica los datos.', 'error');
      return false;
    }
    const success = await this.model.createServicio(data);
    if (success) await this.loadInitialData();
    return success;
  }

  private async handleCreateReserva(data: any): Promise<boolean> {
    const existing = await this.model.getReservas();
    const duplicate = existing.find((res: any) =>
      res.cliente?.toLowerCase().trim() === data.cliente?.toLowerCase().trim() &&
      res.id_servicio === data.id_servicio
    );
    if (duplicate) {
      this.view.showCustomModal('Dato duplicado', 'Ya existe una reserva de ese cliente para el mismo servicio. Por favor, verifica los datos.', 'error');
      return false;
    }
    const success = await this.model.createReserva(data);
    if (success) await this.loadInitialData();
    return success;
  }

  private async handleUpdateOperador(id: number, data: any): Promise<boolean> {
    return await this.model.updateOperador(id, data);
  }

  private async handleDeleteOperador(id: number): Promise<boolean> {
    return await this.model.deleteOperador(id);
  }

  private async handleUpdateServicio(id: number, data: any): Promise<boolean> {
    return await this.model.updateServicio(id, data);
  }

  private async handleDeleteServicio(id: number): Promise<boolean> {
    return await this.model.deleteServicio(id);
  }

  private async handleUpdateReserva(id: number, data: any): Promise<boolean> {
    return await this.model.updateReserva(id, data);
  }

  private async handleDeleteReserva(id: number): Promise<boolean> {
    return await this.model.deleteReserva(id);
  }

  private async handleResolveReclamo(id: number): Promise<boolean> {
    return await this.model.resolveReclamacion(id);
  }
}

export function bootstrapMVC(): void {
  const model = new Model();
  const view = new View();
  new Controller(model, view);
}
