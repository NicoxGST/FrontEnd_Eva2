// TypeScript
// src/app/pages/clientes/clientes.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { ClientesComponent } from './clientes';
import { ClienteService } from '../../services/api';

describe('ClientesComponent - guardar botón', () => {
  let fixture: ComponentFixture<ClientesComponent>;
  let component: ClientesComponent;
  const mockService = {
    guardarCliente: jasmine.createSpy('guardarCliente').and.returnValue(of({
      id_cliente: 1,
      rut: '12345678-9',
      nombre: 'Prueba',
      email_contacto: 'a@b.cl',
      telefono: '987654321',
      direccion_facturacion: 'Calle 1',
      estado: 'activo'
    })),
    obtenerClientes: jasmine.createSpy('obtenerClientes').and.returnValue(of([])),
    actualizarCliente: jasmine.createSpy('actualizarCliente').and.returnValue(of({})),
    eliminarCliente: jasmine.createSpy('eliminarCliente').and.returnValue(of(void 0))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientesComponent],
      imports: [ReactiveFormsModule, CommonModule],
      providers: [{ provide: ClienteService, useValue: mockService }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe llamar a clienteService.guardarCliente al enviar formulario válido', fakeAsync(() => {
    // Poblar el formulario con valores válidos
    component.clienteForm.setValue({
      rut: '12345678-9',
      nombre: 'Prueba',
      email_contacto: 'a@b.cl',
      telefono: '987654321',
      direccion_facturacion: 'Calle 1',
      estado: 'activo'
    });
    fixture.detectChanges();

    const btnSave: HTMLButtonElement | null = fixture.nativeElement.querySelector('.btn-save');
    expect(btnSave).withContext('btn-save debe existir').not.toBeNull();

    btnSave!.click();
    tick();
    fixture.detectChanges();

    expect(mockService.guardarCliente).toHaveBeenCalled();
    expect(mockService.guardarCliente).toHaveBeenCalledWith(jasmine.objectContaining({
      rut: '12345678-9',
      nombre: 'Prueba'
    }));
  }));
});
