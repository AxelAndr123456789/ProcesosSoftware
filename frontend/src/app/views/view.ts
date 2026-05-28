export class View {
  private sidebar: HTMLElement | null;
  private topbar: HTMLElement | null;
  private content: HTMLElement | null;
  private searchBar: HTMLElement | null;
  private pages: NodeListOf<HTMLElement>;
  private navItems: NodeListOf<HTMLElement>;
  private emailInput: HTMLInputElement | null;
  private passwordInput: HTMLInputElement | null;
  private loginBtn: HTMLElement | null;
  private logoutBtn: HTMLElement | null;
  private searchInput: HTMLInputElement | null;
  private onCreateOperador: ((data: any) => Promise<boolean>) | null = null;
  private onCreateServicio: ((data: any) => Promise<boolean>) | null = null;
  private onCreateReserva: ((data: any) => Promise<boolean>) | null = null;

  private onUpdateOperador: ((id: number, data: any) => Promise<boolean>) | null = null;
  private onDeleteOperador: ((id: number) => Promise<boolean>) | null = null;

  private onUpdateServicio: ((id: number, data: any) => Promise<boolean>) | null = null;
  private onDeleteServicio: ((id: number) => Promise<boolean>) | null = null;

  private onUpdateReserva: ((id: number, data: any) => Promise<boolean>) | null = null;
  private onDeleteReserva: ((id: number) => Promise<boolean>) | null = null;

  constructor() {
    this.sidebar = document.querySelector('.sidebar');
    this.topbar = document.querySelector('.topbar');
    this.content = document.querySelector('.content');
    this.searchBar = document.querySelector('.search-bar');
    this.pages = document.querySelectorAll('.page');
    this.navItems = document.querySelectorAll('.nav-item');
    this.emailInput = document.querySelector('#login-email');
    this.passwordInput = document.querySelector('#login-password');
    this.loginBtn = document.querySelector('#btn-login');
    this.logoutBtn = document.querySelector('#btn-logout');
    this.searchInput = document.querySelector('#search-input');

    this.bindActionButtons();
    this.bindReclamosActions();
    this.refreshDashboardStats();

    // Expose global filter function for HTML oninput
    (window as any).filterGlobal = (query: string) => {
      this.filterContent(query, '');
    };
  }

  private getBadgeHtml(type: string, text: string): string {
    const styles: Record<string, { bg: string, color: string }> = {
      'green': { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399' },
      'red': { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171' },
      'amber': { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' },
      'blue': { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' },
      'gray': { bg: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af' }
    };
    const s = styles[type] || styles['gray'];
    const bStyle = `display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 50px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; background: ${s.bg}; color: ${s.color};`;
    
    let icon = '✓';
    if (text.includes('Pendiente') && type === 'gray') icon = '◷';
    if (text.includes('No pagado') || text.includes('No Pagado')) icon = '✕';
    
    return `<span class="badge ${type}" style="${bStyle}">${icon} ${text.replace(/[✓◷✕]/g, '').trim()}</span>`;
  }

  public showCustomModal(title: string, msg: string): void {
    const modalOverlay = document.getElementById('reclamo-modal');
    const modalTitle = document.querySelector('.custom-modal-title');
    const modalDesc = document.getElementById('reclamo-modal-desc');
    const modalClose = document.getElementById('reclamo-modal-close');
    const modalOk = document.getElementById('reclamo-modal-ok');
    const modalCancel = document.getElementById('reclamo-modal-cancel');

    if (modalOverlay && modalTitle && modalDesc) {
      modalTitle.textContent = title;
      modalDesc.innerHTML = msg;
      modalOverlay.classList.add('active');
    }

    const closeModal = () => {
      if (modalOverlay) modalOverlay.classList.remove('active');
    };

    if (modalClose) modalClose.onclick = closeModal;
    if (modalCancel) modalCancel.style.display = 'none';
    if (modalOk) {
      modalOk.onclick = closeModal;
      modalOk.textContent = 'Entendido';
    }
  }

  private showFormModal(title: string, fields: Array<{id: string, label: string, type?: string, value?: string, options?: {value: string, label: string}[]}>, onSubmit: (data: Record<string, string>) => void): void {
    const modalOverlay = document.getElementById('reclamo-modal');
    const modalDesc = document.getElementById('reclamo-modal-desc');
    const modalTitle = document.querySelector('.custom-modal-title');
    const modalClose = document.getElementById('reclamo-modal-close');
    const modalOk = document.getElementById('reclamo-modal-ok');
    const modalCancel = document.getElementById('reclamo-modal-cancel');

    if (modalOverlay && modalDesc && modalTitle && modalOk) {
      modalTitle.textContent = title;
      if (modalCancel) modalCancel.style.display = 'block';

      let formHtml = '<div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:5px">';
      fields.forEach(f => {
        const span = (f.id.includes('title') || f.id.includes('client') || f.id.includes('contact')) ? 'grid-column: span 2;' : '';

        let inputHtml = '';
        if (f.type === 'readonly') {
          const val = f.value || '✓ Pagado';
          inputHtml = `<input id="${f.id}" type="text" value="${val}" readonly style="width:100%; box-sizing:border-box; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:14px 16px; color:#10b981; font-size:14px; font-weight:600; outline:none; cursor:default" />`;
        } else if (f.type === 'select' && f.options) {
          inputHtml = `<select id="${f.id}" style="width:100%; box-sizing:border-box; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:12px; padding:14px 16px; color:#fff; font-size:14px; outline:none; transition:all 0.3s; cursor:pointer" onfocus="this.style.borderColor='#a855f7'; this.style.background='rgba(255,255,255,0.12)'" onblur="this.style.borderColor='rgba(255,255,255,0.15)'; this.style.background='rgba(255,255,255,0.08)'">`
          f.options.forEach(opt => {
            const sel = (opt.value === f.value) ? 'selected' : '';
            inputHtml += `<option value="${opt.value}" style="background:#1a1a25; color:#fff" ${sel}>${opt.label}</option>`;
          });
          inputHtml += `</select>`;
        } else if (f.type === 'date') {
          const val = f.value ? `value="${f.value}"` : '';
          inputHtml = `<input id="${f.id}" type="date" ${val} style="width:100%; box-sizing:border-box; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:12px; padding:14px 16px; color:#fff; font-size:14px; outline:none; transition:all 0.3s; cursor:pointer" onfocus="this.style.borderColor='#a855f7'; this.style.background='rgba(255,255,255,0.12)'" onblur="this.style.borderColor='rgba(255,255,255,0.15)'; this.style.background='rgba(255,255,255,0.08)'" />`;
        } else {
          const t = f.type || 'text';
          const val = f.value ? `value="${f.value}"` : '';
          inputHtml = `<input id="${f.id}" type="${t}" ${val} style="width:100%; box-sizing:border-box; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:12px; padding:14px 16px; color:#fff; font-size:14px; outline:none; transition:all 0.3s" onfocus="this.style.borderColor='#a855f7'; this.style.background='rgba(255,255,255,0.12)'" onblur="this.style.borderColor='rgba(255,255,255,0.15)'; this.style.background='rgba(255,255,255,0.08)'" />`;
        }

        formHtml += `
          <div style="${span}">
            <label style="display:block; font-size:11px; font-weight:600; color:var(--txt3); margin-bottom:6px; letter-spacing:0.5px; text-transform:uppercase">${f.label}</label>
            ${inputHtml}
          </div>
        `;
      });
      formHtml += '</div>';
      modalDesc.innerHTML = formHtml;

      const statusSelect = document.getElementById('r-status') as HTMLSelectElement;
      const payInput = document.getElementById('r-pay') as HTMLInputElement;
      if (statusSelect && payInput) {
        const syncPay = () => {
          const v = statusSelect.value;
          if (v === 'Confirmada') {
            payInput.value = '✓ Pagado';
            payInput.style.color = 'var(--green)';
          } else if (v === 'Pendiente') {
            payInput.value = '◷ Pendiente';
            payInput.style.color = 'var(--amber)';
          } else if (v === 'Cancelada') {
            payInput.value = '✕ No pagado';
            payInput.style.color = 'var(--red)';
          }
        };
        syncPay();
        statusSelect.addEventListener('change', syncPay);
      }

      modalOverlay.classList.add('active');

      modalOk.textContent = 'Aceptar';
      modalOk.onclick = () => {
        const prevError = document.getElementById('form-error-banner');
        if (prevError) prevError.remove();

        const emptyFields: string[] = [];
        fields.forEach(f => {
          if (f.type === 'readonly') return;
          const input = document.getElementById(f.id) as HTMLInputElement | HTMLSelectElement;
          if (input) {
            if (f.type !== 'select' && !input.value.trim()) {
              emptyFields.push(f.label);
              input.style.borderColor = 'var(--red)';
              input.style.background = 'rgba(255,77,77,0.05)';
            }
          }
        });

        if (emptyFields.length > 0) {
          const errorBanner = document.createElement('div');
          errorBanner.id = 'form-error-banner';
          errorBanner.style.cssText = 'display:flex; align-items:center; gap:8px; background:rgba(255,77,77,0.1); border:1px solid rgba(255,77,77,0.3); border-radius:8px; padding:10px 14px; margin-bottom:12px;';
          errorBanner.innerHTML = `<span style="font-size:18px">⚠</span><span style="color:var(--red); font-size:12px; font-weight:600">Completa todos los campos obligatorios.</span>`;
          modalDesc.insertBefore(errorBanner, modalDesc.firstChild);
          return;
        }

        const result: Record<string, string> = {};
        fields.forEach(f => {
          const input = document.getElementById(f.id) as HTMLInputElement | HTMLSelectElement;
          result[f.id] = input ? input.value : '';
        });
        onSubmit(result);
        modalOverlay.classList.remove('active');
        modalOk.textContent = 'Entendido';
        if (modalCancel) modalCancel.style.display = 'none';
      };

      const closeHandler = () => {
        modalOverlay.classList.remove('active');
        modalOk.textContent = 'Entendido';
        if (modalCancel) modalCancel.style.display = 'none';
      };

      if (modalClose) modalClose.onclick = closeHandler;
      if (modalCancel) modalCancel.onclick = closeHandler;
    }
  }

  private getNextId(selector: string, prefix: string): string {
    let max = 0;
    document.querySelectorAll(selector).forEach(trElement => {
      const texts = (trElement as HTMLElement).innerText;
      const match = texts.match(new RegExp(`${prefix.replace(/[-]/g, '\\-')}(\\d+)`));
      if (match) {
        const val = parseInt(match[1], 10);
        if (val > max) max = val;
      }
    });
    return `${prefix}${max + 1}`;
  }

  private attachRowActions(tr: HTMLElement) {
    const editBtn = tr.querySelector('button[title="Editar"]') as HTMLElement;
    if (editBtn) {
      editBtn.onclick = () => {
        const isServicio = !!tr.closest('#page-servicios');
        const isOperador = !!tr.closest('#page-operadores');
        const trow = tr as HTMLTableRowElement;

        if (isServicio) {
          const titleEl = trow.cells[0]?.querySelector('div:first-child');
          const currentTitle = titleEl?.textContent?.trim() || '';
          const currentDest = trow.cells[1]?.textContent?.trim() || '';
          const currentInvest = trow.cells[2]?.textContent?.replace('S/.', '').replace(/,/g, '').trim() || '';
          const currentCap = trow.cells[3]?.textContent?.replace(/[^0-9]/g, '') || '';
          const currentOp = trow.cells[4]?.textContent?.trim() || '';
          const currentStatus = trow.cells[5]?.textContent?.includes('Inactivo') ? 'Inactivo' : 'Activo';

          const operadorOptions: Array<{value: string, label: string}> = [];
          Array.from(document.querySelectorAll('#page-operadores tbody tr')).forEach((trElement) => {
            const tro = trElement as HTMLTableRowElement;
            const opId = tro.getAttribute('data-id') || '';
            const name = tro.cells[1]?.textContent?.trim();
            const estado = tro.cells[4]?.textContent?.trim() || '';
            if (opId && name && (estado.includes('Activo') || name === currentOp)) {
              operadorOptions.push({ value: opId, label: name });
            }
          });
          const currentOpId = (Array.from(document.querySelectorAll('#page-operadores tbody tr')) as HTMLTableRowElement[]).find(row => row.cells[1]?.textContent?.trim() === currentOp)?.getAttribute('data-id') || '';
          if (operadorOptions.length === 0 && currentOp) operadorOptions.push({value: currentOpId, label: currentOp});

          this.showFormModal('Modificar Experiencia ✨', [
            {id: 'f-title', label: 'Nombre de la Experiencia', type: 'text', value: currentTitle},
            {id: 'f-target', label: 'Destino (Ej. Cuzco, Perú)', type: 'text', value: currentDest},
            {id: 'f-investment', label: 'Inversión Base (S/.)', type: 'number', value: currentInvest},
            {id: 'f-capacity', label: 'Capacidad Máx.', type: 'number', value: currentCap},
            {id: 'f-operator', label: 'Socio Operador', type: 'select', options: operadorOptions, value: currentOpId},
            {id: 'f-status', label: 'Estado', type: 'select', options: [
              {value: 'Activo', label: 'Activo'},
              {value: 'Inactivo', label: 'Inactivo'}
            ], value: currentStatus}
          ], async (data) => {
            const id = parseInt(tr.getAttribute('data-id') || '0');
            if (this.onUpdateServicio && id) {
              const success = await this.onUpdateServicio(id, {
                nombre: data['f-title'],
                destino: data['f-target'],
                inversion: parseFloat(data['f-investment']),
                capacidad: parseInt(data['f-capacity']),
                id_operador: parseInt(data['f-operator']),
                estado: data['f-status']
              });
              if (!success) {
                this.showError('No se pudo actualizar el servicio');
                return;
              }
            }
            if (titleEl) titleEl.textContent = data['f-title'] || 'Servicio Sin Título';
            trow.cells[1].textContent = data['f-target'] || 'Por definir';
            const invVal = parseFloat(data['f-investment']) || 0;
            trow.cells[2].textContent = `S/. ${invVal.toFixed(2)}`;
            trow.cells[3].textContent = `${data['f-capacity'] || 'Ilimitada'} Personas`;
            const selectedOp = operadorOptions.find(o => o.value === data['f-operator'])?.label || 'N/A';
            trow.cells[4].textContent = selectedOp;

            trow.cells[5].innerHTML = this.getBadgeHtml(data['f-status'] === 'Activo' ? 'green' : 'red', data['f-status']);
            this.refreshDashboardStats();
            this.showCustomModal('Actualización Exitosa', 'El servicio ha sido modificado exitosamente.');
          });
        } else if (isOperador) {
          const currentName = trow.cells[1]?.textContent?.trim() || '';
          const currentPhone = trow.cells[2]?.textContent?.trim() || '';
          const currentStatus = trow.cells[4]?.textContent?.includes('Inactivo') ? 'Inactivo' : 'Activo';

          this.showFormModal('Modificar Operador ✨', [
            {id: 'o-contact', label: 'Nombre Completo', type: 'text', value: currentName},
            {id: 'o-phone', label: 'Teléfono', type: 'text', value: currentPhone},
            {id: 'o-status', label: 'Estado', type: 'select', options: [
              {value: 'Activo', label: 'Activo'},
              {value: 'Inactivo', label: 'Inactivo'}
            ], value: currentStatus}
          ], async (data) => {
            const id = parseInt(tr.getAttribute('data-id') || '0');
            if (this.onUpdateOperador && id) {
              const success = await this.onUpdateOperador(id, {
                contacto: data['o-contact'],
                telefono: data['o-phone'],
                estado: data['o-status']
              });
              if (!success) {
                this.showError('No se pudo actualizar el operador');
                return;
              }
            }
            trow.cells[1].textContent = data['o-contact'] || 'Desconocido';
            trow.cells[2].textContent = data['o-phone'] || 'N/A';

            trow.cells[4].innerHTML = this.getBadgeHtml(data['o-status'] === 'Activo' ? 'green' : 'red', data['o-status']);
            this.showCustomModal('Actualización Exitosa', 'Los datos del operador han sido actualizados.');
          });
        } else if (!!tr.closest('#page-reservas')) {
          const currentId = trow.cells[0]?.textContent?.trim() || '';
          const currentClient = trow.cells[1]?.textContent?.trim() || '';
          const currentSvc = trow.cells[2]?.textContent?.trim() || '';
          const currentDate = trow.cells[3]?.textContent?.trim() || '';

          let dateValue = '';
          if (currentDate && currentDate !== 'Por definir') {
            const months: Record<string, string> = { 
              'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06', 
              'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12' 
            };
            const parts = currentDate.toLowerCase().split(' ');
            if (parts.length >= 3) {
              const d = parts[0].padStart(2, '0');
              const mStr = parts[1].replace(',', '').trim();
              const m = months[mStr];
              const y = parts[parts.length - 1];
              if (m) dateValue = `${y}-${m}-${d}`;
            }
          }

          const servicioOptions: Array<{value: string, label: string}> = [];
          Array.from(document.querySelectorAll('#page-servicios tbody tr')).forEach((trElement) => {
            const trSvc = trElement as HTMLTableRowElement;
            const svcId = trSvc.getAttribute('data-id') || '';
            const divName = trSvc.cells[0]?.querySelector('div')?.textContent?.trim() || '';
            if (svcId && divName) {
              servicioOptions.push({ value: svcId, label: divName });
            }
          });
          const currentSvcId = (Array.from(document.querySelectorAll('#page-servicios tbody tr')) as HTMLTableRowElement[]).find(row => row.cells[0]?.querySelector('div')?.textContent?.trim() === currentSvc)?.getAttribute('data-id') || '';
          if (servicioOptions.length === 0 && currentSvc) servicioOptions.push({value: currentSvcId, label: currentSvc});

          const currentStatus = trow.cells[4]?.textContent?.includes('Confirmada') ? 'Confirmada' : (trow.cells[4]?.textContent?.includes('Cancelada') ? 'Cancelada' : 'Pendiente');
          const currentPay = trow.cells[5]?.textContent?.trim() || '';

          this.showFormModal('Modificar Reserva ✨', [
            {id: 'r-client', label: 'Nombre Completo del Pasajero', type: 'text', value: currentClient},
            {id: 'r-svc', label: 'Servicio a Reservar', type: 'select', options: servicioOptions, value: currentSvcId},
            {id: 'r-date', label: 'Fecha de Reserva', type: 'date', value: dateValue},
            {id: 'r-status', label: 'Estado de Reserva', type: 'select', options: [
              {value: 'Confirmada', label: 'Confirmada'},
              {value: 'Pendiente', label: 'Pendiente'},
              {value: 'Cancelada', label: 'Cancelada'}
            ], value: currentStatus},
            {id: 'r-pay', label: 'Estado de Pago', type: 'readonly', value: currentPay}
          ], async (data) => {
            const id = parseInt(tr.getAttribute('data-id') || '0');
            if (this.onUpdateReserva && id) {
              const success = await this.onUpdateReserva(id, {
                cliente: data['r-client'],
                id_servicio: parseInt(data['r-svc']),
                estado_reserva: data['r-status'],
                estado_pago: data['r-status'] === 'Confirmada' ? 'Pagado' : 'Pendiente'
              });
              if (!success) {
                this.showError('No se pudo actualizar la reserva');
                return;
              }
            }
            trow.cells[1].textContent = data['r-client'] || 'Huésped Anónimo';
            const selectedSvc = servicioOptions.find(s => s.value === data['r-svc'])?.label || 'Ninguno';
            trow.cells[2].textContent = selectedSvc;

            let displayDate = currentDate;
            if (data['r-date']) {
              const [y, m, d] = data['r-date'].split('-');
              const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
              displayDate = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '');
              const parts = displayDate.split(' ');
              if (parts.length >= 3) {
                const capMonth = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
                displayDate = `${parts[0]} ${capMonth}, ${parts[parts.length - 1]}`;
              }
            }
            trow.cells[3].textContent = displayDate;

            let stType = 'gray';
            if (data['r-status'] === 'Confirmada') stType = 'green';
            if (data['r-status'] === 'Cancelada') stType = 'red';
            trow.cells[4].innerHTML = this.getBadgeHtml(stType, data['r-status']);

            let pyType = 'amber';
            let pyText = '◷ Pendiente';
            if (data['r-status'] === 'Confirmada') { pyType = 'blue'; pyText = '✓ Pagado'; }
            if (data['r-status'] === 'Cancelada') { pyType = 'red'; pyText = '✕ No Pagado'; }
            trow.cells[5].innerHTML = this.getBadgeHtml(pyType, pyText);

            this.refreshDashboardStats();
            this.showCustomModal('Actualización Exitosa', 'La reserva ha sido modificada.');
          });
        }
      };
    }

    const delBtn = tr.querySelector('button[title="Eliminar"]') as HTMLElement;
    if (delBtn) {
      delBtn.onclick = () => {
        const id = parseInt(tr.getAttribute('data-id') || '0');
        const isServicio = !!tr.closest('#page-servicios');
        const isOperador = !!tr.closest('#page-operadores');
        const isReserva = !!tr.closest('#page-reservas');

        this.showDeleteModal(async () => {
          let success = false;
          if (isOperador && this.onDeleteOperador) success = await this.onDeleteOperador(id);
          else if (isServicio && this.onDeleteServicio) success = await this.onDeleteServicio(id);
          else if (isReserva && this.onDeleteReserva) success = await this.onDeleteReserva(id);
          else success = true; // For other hardcoded things

          if (success) {
            tr.remove();
            this.refreshDashboardStats();
            this.showCustomModal('Registro Eliminado', 'El registro fue eliminado correctamente.');
          } else {
            this.showError('No se pudo eliminar el registro de la base de datos');
          }
        });
      };
    }
  }

  private bindActionButtons(): void {
    const btnReserva = document.getElementById('btn-new-reserva');
    if (btnReserva) {
      btnReserva.onclick = () => {
        const servicioOptions = Array.from(document.querySelectorAll('#page-servicios tbody tr'))
          .filter(trElement => {
            const tr = trElement as HTMLTableRowElement;
            const status = tr.cells[5]?.textContent?.trim() || '';
            return status.includes('Activo');
          })
          .map(trElement => {
            const tr = trElement as HTMLTableRowElement;
            const svcId = tr.getAttribute('data-id') || '';
            const divName = tr.cells[0]?.querySelector('div')?.textContent?.trim() || 'Servicio Desconocido';
            return { value: svcId, label: divName };
          });

        this.showFormModal('Registro de Nuevo Cliente ✨', [
          {id: 'r-client', label: 'Nombre Completo del Pasajero'},
          {id: 'r-svc', label: 'Servicio a Reservar', type: 'select', options: servicioOptions},
          {id: 'r-date', label: 'Fecha de Reserva', type: 'date'},
          {id: 'r-status', label: 'Estado de Reserva', type: 'select', options: [
            {value: 'Confirmada', label: 'Confirmada'},
            {value: 'Pendiente', label: 'Pendiente'},
            {value: 'Cancelada', label: 'Cancelada'}
          ]}
        ], async (data) => {
          if (this.onCreateReserva) {
            const success = await this.onCreateReserva({
              cliente: data['r-client'],
              id_servicio: parseInt(data['r-svc']),
              estado_reserva: data['r-status'],
              estado_pago: data['r-status'] === 'Confirmada' ? 'Pagado' : 'Pendiente'
            });
            if (!success) {
              this.showError('No se pudo guardar la reserva');
            } else {
              this.showCustomModal('Registro Exitoso ✨', 'La nueva reserva ha sido registrada correctamente.');
            }
          }
        });
      };
    }

    const btnServicio = document.getElementById('btn-new-servicio');
    if (btnServicio) {
      btnServicio.onclick = () => {
        const operadorOptions: Array<{value: string, label: string}> = [];
        Array.from(document.querySelectorAll('#page-operadores tbody tr')).forEach(trElement => {
          const tr = trElement as HTMLTableRowElement;
          const name = tr.cells[1]?.textContent?.trim();
          const opId = tr.getAttribute('data-id') || '';
          const estado = tr.cells[4]?.textContent?.trim() || '';
          if (name && opId && estado.includes('Activo')) {
            operadorOptions.push({ value: opId, label: name });
          }
        });
        if (operadorOptions.length === 0) operadorOptions.push({value: 'Ninguno disponible', label: 'Ninguno activo disponible'});

        this.showFormModal('Diseñar Nueva Experiencia ✨', [
          {id: 'f-title', label: 'Nombre de la Experiencia', type: 'text'},
          {id: 'f-target', label: 'Destino (Ej. Cuzco, Perú)', type: 'text'},
          {id: 'f-investment', label: 'Inversión Base (S/.)', type: 'number'},
          {id: 'f-capacity', label: 'Capacidad Máx.', type: 'number'},
          {id: 'f-operator', label: 'Socio Operador', type: 'select', options: operadorOptions},
          {id: 'f-status', label: 'Estado Inicial', type: 'select', options: [
            {value: 'Activo', label: 'Activo'},
            {value: 'Inactivo', label: 'Inactivo'}
          ]}
        ], async (data) => {
          if (this.onCreateServicio) {
            const success = await this.onCreateServicio({
              nombre: data['f-title'],
              destino: data['f-target'],
              inversion: parseFloat(data['f-investment']),
              capacidad: parseInt(data['f-capacity']),
              id_operador: parseInt(data['f-operator']),
              estado: data['f-status']
            });
            if (!success) {
              this.showError('No se pudo guardar el servicio');
            } else {
              this.showCustomModal('Experiencia Creada ✨', 'El nuevo servicio ha sido diseñado y guardado.');
            }
          }
        });
      };
    }

    const btnOperador = document.getElementById('btn-new-operador');
    if (btnOperador) {
      btnOperador.onclick = () => {
        const today = new Date();
        const todayIso = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        const monthsMap: Record<string, string> = { 'ene': 'Ene', 'feb': 'Feb', 'mar': 'Mar', 'abr': 'Abr', 'may': 'May', 'jun': 'Jun', 'jul': 'Jul', 'ago': 'Ago', 'sep': 'Sep', 'oct': 'Oct', 'nov': 'Nov', 'dic': 'Dic' };
        const regDate = `${String(today.getDate()).padStart(2, '0')} ${monthsMap[today.toLocaleDateString('es-ES', { month: 'short' }).toLowerCase()]}, ${today.getFullYear()}`;

        const formatPhone = (phone: string) => {
          const digits = phone.replace(/\D/g, '');
          if (digits.length === 9) {
            return `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6)}`;
          }
          return phone;
        };

        this.showFormModal('Registro de Nuevo Operador ✨', [
          { id: 'o-contact', label: 'Nombre Completo del Operador', type: 'text' },
          { id: 'o-phone', label: 'Teléfono', type: 'text' },
          { id: 'o-date', label: 'Fecha de Registro', type: 'date', value: todayIso },
          { id: 'o-status', label: 'Estado', type: 'select', options: [
            { value: 'Activo', label: 'Activo' },
            { value: 'Inactivo', label: 'Inactivo' },
          ]}
        ], async (data) => {
          if (this.onCreateOperador) {
            const success = await this.onCreateOperador({
              contacto: data['o-contact'],
              telefono: data['o-phone'],
              estado: data['o-status']
            });
            if (!success) {
              this.showError('No se pudo guardar en la base de datos');
            } else {
              this.showCustomModal('Socio Registrado ✨', 'El nuevo operador ha sido dado de alta exitosamente.');
            }
          }
        });
      };
    }

    const btnExportRes = document.getElementById('btn-export-reserva');
    if (btnExportRes) {
      btnExportRes.onclick = () => {
        this.showCustomModal('Exportación Exitosa', 'El reporte de reservas ha sido exportado.');
      };
    }

    const existingTrs = document.querySelectorAll('tbody tr');
    existingTrs.forEach((tr: Element) => this.attachRowActions(tr as HTMLElement));
  }

  private bindReclamosActions(): void {
    const viewBtns = document.querySelectorAll('.btn-view-reclamo');

    viewBtns.forEach((btn: Element) => {
      (btn as HTMLElement).onclick = (e) => {
        const btnElement = e.currentTarget as HTMLElement;
        const desc = btnElement.getAttribute('data-desc');

        if (desc) {
          this.showCustomModal('Detalle del Reclamo', desc);
        }

        const tr = btnElement.closest('tr');
        if (tr) {
          const statusSpan = tr.querySelector('.badge');
          if (statusSpan && statusSpan.textContent?.includes('Pendiente')) {
            statusSpan.outerHTML = this.getBadgeHtml('green', 'Resuelto');
          }
        }
      };
    });

    const resolveBtns = document.querySelectorAll('.btn-resolve-reclamo');
    resolveBtns.forEach((btn: Element) => {
      (btn as HTMLElement).onclick = (e) => {
        const card = (e.currentTarget as HTMLElement).closest('.feedback-card');
        const tr = (e.currentTarget as HTMLElement).closest('tr');
        const container = card || tr;

        if (container) {
          const badge = container.querySelector('.badge');
          if (badge && badge.textContent?.includes('Pendiente')) {
            badge.className = 'badge green';
            badge.textContent = 'Resuelto';
          }
          const resolveBtn = e.currentTarget as HTMLButtonElement;
          resolveBtn.textContent = 'Resuelto';
          resolveBtn.disabled = true;
          resolveBtn.style.opacity = '0.5';
          resolveBtn.style.cursor = 'not-allowed';
          this.refreshDashboardStats();
        }
      };
    });
  }

  private showDeleteModal(onConfirm: () => void): void {
    const modal = document.getElementById('delete-modal');
    const confirmBtn = document.getElementById('delete-modal-confirm');
    const cancelBtn = document.getElementById('delete-modal-cancel');
    if (!modal || !confirmBtn || !cancelBtn) return;
    modal.classList.add('active');
    const close = () => modal.classList.remove('active');
    confirmBtn.onclick = () => { close(); onConfirm(); };
    cancelBtn.onclick = close;
    modal.onclick = (e: MouseEvent) => { if (e.target === modal) close(); };
  }

  private refreshDashboardStats(): void {
    const resValueEl = document.getElementById('stat-reservas');
    const svcValueEl = document.getElementById('stat-servicios');
    const incValueEl = document.getElementById('stat-ingresos');
    const claimValueEl = document.getElementById('stat-reclamos');

    if (resValueEl) {
      const totalReservas = document.querySelectorAll('#page-reservas tbody tr').length;
      resValueEl.textContent = totalReservas.toString();
    }

    if (svcValueEl) {
      const activeServicios = Array.from(document.querySelectorAll('#page-servicios tbody tr')).filter(tr => {
        return tr.querySelector('.badge.green') !== null;
      }).length;
      svcValueEl.textContent = activeServicios.toString();
    }

    if (incValueEl) {
      let totalIncome = 0;
      document.querySelectorAll('#page-reservas tbody tr').forEach(tr => {
        const row = tr as HTMLTableRowElement;
        const status = row.cells[4]?.textContent || '';
        if (status.includes('Confirmada')) {
          const serviceName = row.cells[2]?.textContent?.trim() || '';
          const svcRow = Array.from(document.querySelectorAll('#page-servicios tbody tr')).find(sTr => {
            const sRow = sTr as HTMLTableRowElement;
            const nameInTable = sRow.cells[0]?.querySelector('div:first-child')?.textContent?.trim();
            return nameInTable === serviceName;
          });
          if (svcRow) {
            const priceStr = (svcRow as HTMLTableRowElement).cells[2]?.textContent?.replace('S/.', '').replace(/,/g, '').trim() || '0';
            totalIncome += parseFloat(priceStr);
          }
        }
      });
      incValueEl.textContent = totalIncome.toLocaleString('en-US', { minimumFractionDigits: 0 });
    }

    if (claimValueEl) {
      const pendingClaims = Array.from(document.querySelectorAll('#page-reclamaciones .feedback-card')).filter(card => {
        return card.querySelector('.badge.amber') !== null;
      }).length;
      claimValueEl.textContent = pendingClaims.toString();
    }

    const barsContainer = document.getElementById('activity-chart-bars');
    const labelsContainer = document.getElementById('activity-chart-labels');
    if (barsContainer && labelsContainer) {
      const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      const now = new Date();
      const currentDay = now.getDay();
      const startDiff = now.getDate() - (currentDay === 0 ? 6 : currentDay - 1);
      const monday = new Date(now.setDate(startDiff));

      let barsHtml = '';
      let labelsHtml = '';
      const counts: number[] = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dayStr = d.getDate().toString().padStart(2, '0');
        const monthStr = d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toLowerCase();
        const searchPattern = `${dayStr} ${monthStr}`;

        const count = Array.from(document.querySelectorAll('#page-reservas tbody tr')).filter(tr => {
          const row = tr as HTMLTableRowElement;
          const tableDate = row.cells[3]?.textContent?.toLowerCase() || '';
          const status = row.cells[4]?.textContent || '';
          return status.includes('Confirmada') && tableDate.includes(searchPattern);
        }).length;
        
        counts.push(count);
        
        const dayName = days[i];
        const dateLabel = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase().replace('.', '');
        labelsHtml += `
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px;">
            <div style="font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.8);">${dayName}</div>
            <div style="font-size: 9px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px;">${dateLabel}</div>
          </div>
        `;
      }

      const maxVal = Math.max(...counts, 5);
      counts.forEach(c => {
        const flexGrow = Math.max((c / maxVal), 0.04);
        barsHtml += `
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; min-width: 0; min-height: 0;">
            <div style="height: 24px; display: flex; align-items: flex-end; justify-content: center; flex-shrink: 0; margin-bottom: 8px;">
              <span style="font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.9);">${c}</span>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; width: 100%; min-height: 0;">
              <div style="flex-grow: ${1 - flexGrow}; width: 100%; transition: flex-grow 0.5s ease;"></div>
              <div style="width: 85%; max-width: 48px; margin: 0 auto; background: linear-gradient(to top, #6366f1, #a855f7); border-radius: 6px 6px 0 0; flex-grow: ${flexGrow}; box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); transition: flex-grow 0.5s ease;"></div>
            </div>
          </div>
        `;
      });

      barsContainer.innerHTML = barsHtml;
      labelsContainer.innerHTML = labelsHtml;
    }

    const recentListEl = document.getElementById('dashboard-recent-list');
    if (recentListEl) {
      let recentHtml = '';
      const confirmedRows = Array.from(document.querySelectorAll('#page-reservas tbody tr')).filter(tr => {
        return tr.querySelector('.badge.green') !== null;
      }).slice(0, 3);

      confirmedRows.forEach((tr, index) => {
        const row = tr as HTMLTableRowElement;
        const name = row.cells[1]?.textContent?.trim() || 'Huésped Anónimo';
        const service = row.cells[2]?.textContent?.trim() || 'Servicio';
        const isLast = index === confirmedRows.length - 1;
        const borderBottom = isLast ? 'none' : '1px solid rgba(255,255,255,0.06)';
        recentHtml += `
          <div class="recent-item" style="display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: ${borderBottom};">
            <div class="recent-info" style="display: flex; flex-direction: column; gap: 4px;">
              <div class="recent-name" style="font-weight: 800; color: #fff; font-size: 14px;">${name}</div>
              <div class="recent-service" style="color: rgba(255, 255, 255, 0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">${service}</div>
            </div>
            <span class="badge green" style="background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 6px 14px; border-radius: 50px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap;">Confirmada</span>
          </div>
        `;
      });
      recentListEl.innerHTML = recentHtml || '<div class="recent-item">Sin reservas confirmadas</div>';
    }

    document.querySelectorAll('#page-servicios tbody tr').forEach(svcTr => {
      const sRow = svcTr as HTMLTableRowElement;
      const serviceName = sRow.cells[0]?.querySelector('div:first-child')?.textContent?.trim();
      const capCell = sRow.cells[3];
      if (serviceName && capCell) {
        const baseCap = parseInt(capCell.getAttribute('data-base-capacity') || '0');
        const confirmedCount = Array.from(document.querySelectorAll('#page-reservas tbody tr')).filter(resTr => {
          const rRow = resTr as HTMLTableRowElement;
          const rSvcName = rRow.cells[2]?.textContent?.trim();
          const rStatus = rRow.cells[4]?.textContent || '';
          return rSvcName === serviceName && rStatus.includes('Confirmada');
        }).length;
        const currentCap = baseCap - confirmedCount;
        capCell.textContent = `${currentCap} Personas`;
      }
    });
  }

  public render(state: { currentPage: string; isLoggedIn: boolean }): void {
    const { currentPage, isLoggedIn } = state;

    const loginPage = document.getElementById('login-page');
    const mainApp = document.getElementById('main-app');

    if (!isLoggedIn) {
      if (loginPage) loginPage.style.display = 'flex';
      if (mainApp) mainApp.style.display = 'none';
      return;
    }

    if (loginPage) loginPage.style.display = 'none';
    if (mainApp) {
      mainApp.style.display = 'flex';
      mainApp.className = `main-app page-${currentPage}`;
    }

    const pageTitles: Record<string, string> = {
      'dashboard': 'Dashboard',
      'servicios': 'Servicios',
      'reservas': 'Reservas',
      'operadores': 'Alianzas Estratégicas',
      'reclamaciones': 'Reclamos e Incidencias',
      'feedback': 'Feedback de Clientes'
    };

    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
      pageTitle.textContent = pageTitles[currentPage] || currentPage;
    }

    if (this.searchBar) {
      this.searchBar.style.display = currentPage === 'dashboard' ? 'none' : 'flex';
      if (this.searchInput) {
        this.searchInput.value = '';
        this.filterContent('', currentPage);
      }
    }


    this.pages.forEach(page => {
      const pageId = page.id.replace('page-', '');
      if (pageId === currentPage) {
        page.style.display = 'block';
        page.classList.add('active');
      } else {
        page.style.display = 'none';
        page.classList.remove('active');
      }
    });

    this.navItems.forEach(item => {
      const pageId = item.getAttribute('data-page');
      if (pageId === currentPage) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  public bindLogin(handler: (email: string, password: string) => void): void {
    if (this.loginBtn) {
      this.loginBtn.onclick = (e) => {
        e.preventDefault();
        if (this.emailInput && this.passwordInput) {
          handler(this.emailInput.value, this.passwordInput.value);
        }
      };
    }
  }

  public bindNavigation(handler: (pageId: string) => void): void {
    this.navItems.forEach(item => {
      item.onclick = (e) => {
        const pageId = (e.currentTarget as HTMLElement).getAttribute('data-page');
        if (pageId) {
          handler(pageId);
        }
      };
    });
  }

  public bindLogout(handler: () => void): void {
    if (this.logoutBtn) {
      this.logoutBtn.onclick = () => handler();
    }
  }

  public bindSearch(handler: (query: string) => void): void {
    // Global delegation: listener on document to catch events from search-input
    // even if Angular replaces the element in the DOM.
    document.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      if (target && target.id === 'search-input') {
        handler(target.value);
      }
    });
  }

  public showError(msg: string): void {

    alert(msg);
  }

  public filterContent(query: string, page: string): void {
    const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const q = normalize(query);
    
    const tables = document.querySelectorAll('table tbody');
    tables.forEach((tbody: Element) => {
      const rows = Array.from(tbody.querySelectorAll('tr:not(.no-results-row)'));
      let visibleCount = 0;

      rows.forEach((tr: any) => {
        const row = tr;
        const text = normalize(row.textContent || '');
        const matches = text.includes(q);
        
        row.classList.toggle('hidden-search', !matches);
        if (matches) visibleCount++;
      });

      let noResultsRow = tbody.querySelector('.no-results-row');
      if (visibleCount === 0 && q !== '') {
        if (!noResultsRow) {
          const colCount = 10;
          const tr = document.createElement('tr');
          tr.className = 'no-results-row';
          tr.innerHTML = `<td colspan="${colCount}" style="padding: 40px; text-align: center; color: var(--txt3); font-size: 14px; background: transparent !important; border: none;">No se encontraron resultados para "${query}"</td>`;
          tbody.appendChild(tr);
        }
      } else if (noResultsRow) {
        noResultsRow.remove();
      }
    });

    const cards = document.querySelectorAll('.feedback-card, .testimonial-card');
    cards.forEach((card: Element) => {
      const el = card;
      const text = normalize(el.textContent || '');
      el.classList.toggle('hidden-search', !text.includes(q));
    });
  }

  public bindCreateOperador(handler: (data: any) => Promise<boolean>): void {
    this.onCreateOperador = handler;
  }

  public bindCreateServicio(handler: (data: any) => Promise<boolean>): void {
    this.onCreateServicio = handler;
  }

  public bindCreateReserva(handler: (data: any) => Promise<boolean>): void {
    this.onCreateReserva = handler;
  }

  public bindUpdateOperador(handler: (id: number, data: any) => Promise<boolean>): void {
    this.onUpdateOperador = handler;
  }

  public bindDeleteOperador(handler: (id: number) => Promise<boolean>): void {
    this.onDeleteOperador = handler;
  }

  public bindUpdateServicio(handler: (id: number, data: any) => Promise<boolean>): void {
    this.onUpdateServicio = handler;
  }

  public bindDeleteServicio(handler: (id: number) => Promise<boolean>): void {
    this.onDeleteServicio = handler;
  }

  public bindUpdateReserva(handler: (id: number, data: any) => Promise<boolean>): void {
    this.onUpdateReserva = handler;
  }

  public bindDeleteReserva(handler: (id: number) => Promise<boolean>): void {
    this.onDeleteReserva = handler;
  }

  public renderOperadores(operadores: any[]): void {
    const tbody = document.querySelector('#page-operadores tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    operadores.forEach((op: any) => {
      const opIdDisplay = `#OP-${String(op.id_operador).padStart(4, '0')}`;
      const btnStyle = 'display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 10px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: var(--txt2); cursor: pointer; transition: all 0.3s; padding:0; margin:0;';
      const tdStyle = 'padding: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.03); vertical-align: middle; color: var(--txt2); font-size: 14px;';
      const statusBadge = this.getBadgeHtml(op.estado === 'Activo' ? 'green' : 'red', op.estado);
      const rawRow = `
        <tr data-id="${op.id_operador}">
          <td style="${tdStyle}">${opIdDisplay}</td>
          <td style="${tdStyle}; font-weight:600; color:var(--txt)">${op.contacto}</td>
          <td style="${tdStyle}">${op.telefono || 'N/A'}</td>
          <td style="${tdStyle}">${op.fecha_registro ? new Date(op.fecha_registro).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : 'Por definir'}</td>
          <td style="${tdStyle}">${statusBadge}</td>
          <td style="${tdStyle}">
            <div class="action-buttons" style="display: flex; gap: 10px;">
              <button class="btn-action" title="Editar" style="${btnStyle}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
              <button class="btn-action danger" title="Eliminar" style="${btnStyle}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
            </div>
          </td>
        </tr>`;
      tbody.insertAdjacentHTML('beforeend', rawRow);
      this.attachRowActions(tbody.lastElementChild as HTMLElement);
    });
  }

  public renderServicios(servicios: any[]): void {
    const tbody = document.querySelector('#page-servicios tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    servicios.forEach((svc: any) => {
      const svcIdDisplay = `#ST-${String(svc.id_servicio).padStart(5, '0')}`;
      const btnStyle = 'display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 10px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: var(--txt2); cursor: pointer; transition: all 0.3s; padding:0; margin:0;';
      const tdStyle = 'padding: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.03); vertical-align: middle; color: var(--txt2); font-size: 14px;';
      const statusBadge = this.getBadgeHtml(svc.estado === 'Activo' ? 'green' : 'red', svc.estado);
      const rawRow = `
        <tr data-id="${svc.id_servicio}">
          <td style="${tdStyle}">
            <div style="font-weight:600; color:var(--txt); font-size: 14px; line-height: 1.2;">${svc.nombre}</div>
            <div style="font-size:11px; color:var(--txt3); margin-top: 2px;">${svcIdDisplay}</div>
          </td>
          <td style="${tdStyle}">${svc.destino}</td>
          <td style="${tdStyle}; font-weight:600; color:var(--txt); white-space:nowrap">S/. ${parseFloat(svc.inversion).toFixed(2)}</td>
          <td data-base-capacity="${svc.capacidad}" style="${tdStyle}; white-space:nowrap">${svc.capacidad} Personas</td>
          <td style="${tdStyle}; white-space:nowrap">${svc.nombre_operador || 'N/A'}</td>
          <td style="${tdStyle}">${statusBadge}</td>
          <td style="${tdStyle}">
            <div class="action-buttons" style="display: flex; gap: 10px;">
              <button class="btn-action" title="Editar" style="${btnStyle}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
              <button class="btn-action danger" title="Eliminar" style="${btnStyle}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
            </div>
          </td>
        </tr>`;
      tbody.insertAdjacentHTML('beforeend', rawRow);
      this.attachRowActions(tbody.lastElementChild as HTMLElement);
    });
  }

  public renderReservas(reservas: any[]): void {
    const tbody = document.querySelector('#page-reservas tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    reservas.forEach((res: any) => {
      const resIdDisplay = `#RES-${String(res.id_reserva).padStart(5, '0')}`;
      const btnStyle = 'display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 10px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: var(--txt2); cursor: pointer; transition: all 0.3s; padding:0; margin:0;';
      const tdStyle = 'padding: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.03); vertical-align: middle; color: var(--txt2); font-size: 14px;';
      let stType = 'gray';
      if (res.estado_reserva === 'Confirmada') stType = 'green';
      if (res.estado_reserva === 'Cancelada') stType = 'red';
      const statusBadge = this.getBadgeHtml(stType, res.estado_reserva);
      let pyType = 'amber';
      if (res.estado_pago === 'Pagado') pyType = 'blue';
      if (res.estado_pago === 'No Pagado') pyType = 'red';
      const payBadge = this.getBadgeHtml(pyType, res.estado_pago);
      const rawRow = `
        <tr data-id="${res.id_reserva}">
          <td style="${tdStyle}; white-space:nowrap; font-weight:600; color:var(--txt);">${resIdDisplay}</td>
          <td style="${tdStyle}; font-weight:600; color:var(--txt);">${res.cliente}</td>
          <td style="${tdStyle}">${res.nombre_servicio || 'N/A'}</td>
          <td style="${tdStyle}">${res.fecha_reserva ? new Date(res.fecha_reserva).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : 'Por definir'}</td>
          <td style="${tdStyle}">${statusBadge}</td>
          <td style="${tdStyle}">${payBadge}</td>
          <td style="${tdStyle}">
            <div class="action-buttons" style="display: flex; gap: 10px;">
              <button class="btn-action" title="Editar" style="${btnStyle}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
              <button class="btn-action danger" title="Eliminar" style="${btnStyle}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
            </div>
          </td>
        </tr>`;
      tbody.insertAdjacentHTML('beforeend', rawRow);
      this.attachRowActions(tbody.lastElementChild as HTMLElement);
    });
  }

  public renderReclamaciones(reclamaciones: any[]): void {
    const grid = document.querySelector('#page-reclamaciones .feedback-grid');
    if (!grid || !reclamaciones || reclamaciones.length === 0) return;
    grid.innerHTML = '';
    reclamaciones.forEach((rec: any) => {
      const recIdDisplay = `#REC-${String(rec.id_reclamacion).padStart(3, '0')}`;
      const statusBadge = this.getBadgeHtml(rec.estado === 'Resuelto' ? 'green' : 'amber', rec.estado);
      const initials = (rec.cliente || '??').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
      
      const cardHtml = `
        <div class="feedback-card" data-id="${rec.id_reclamacion}">
          <div class="feedback-header">
            <div class="feedback-id">${recIdDisplay}</div>
            ${statusBadge}
          </div>
          <div class="feedback-client">
            <div class="client-avatar">${initials}</div>
            <div>
              <div class="client-name">${rec.cliente}</div>
              <div class="client-service">${rec.nombre_servicio || 'Servicio Desconocido'}</div>
            </div>
          </div>
          <p class="feedback-desc">${rec.descripcion}</p>
          <div class="feedback-actions">
            <button class="btn-resolve-reclamo" ${rec.estado === 'Resuelto' ? 'disabled style="opacity:0.5; cursor:not-allowed"' : ''}>
              ${rec.estado === 'Resuelto' ? 'Resuelto' : 'Marcar Resuelto'}
            </button>
          </div>
        </div>`;
      grid.insertAdjacentHTML('beforeend', cardHtml);
    });
    this.bindReclamosActions();
  }

  public renderFeedback(feedback: any[]): void {
    const grid = document.querySelector('#page-feedback .feedback-grid');
    if (!grid || !feedback || feedback.length === 0) return;
    grid.innerHTML = '';
    feedback.forEach((fb: any) => {
      const initials = (fb.cliente || '??').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
      const stars = '★'.repeat(fb.valoracion) + '☆'.repeat(5 - fb.valoracion);
      const timeAgo = new Date(fb.fecha).toLocaleDateString();
      
      const cardHtml = `
        <div class="testimonial-card">
          <div class="testimonial-header">
            <div class="testimonial-user">
              <div class="client-avatar circle" style="background: var(--grad-main)">${initials}</div>
              <div class="user-meta">
                <div class="client-name">${fb.cliente}</div>
                <div class="tour-name">TOUR: ${fb.nombre_servicio || 'N/A'}</div>
              </div>
            </div>
            <div class="rating-info">
              <div class="stars">${stars}</div>
              <div class="time-ago">${timeAgo}</div>
            </div>
          </div>
          <p class="testimonial-text">"${fb.comentario}"</p>
        </div>`;
      grid.insertAdjacentHTML('beforeend', cardHtml);
    });
  }
}
