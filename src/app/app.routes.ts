import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { ClientesComponent } from './pages/clientes/clientes';
import { MedidoresComponent } from './pages/medidores/medidores';
import { LecturasComponent } from './pages/lecturas/lecturas';
import { BoletasComponent } from './pages/boletas/boletas';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'clientes', component: ClientesComponent },
  { path: 'medidores', component: MedidoresComponent },
  { path: 'lecturas', component: LecturasComponent },
  { path: 'boletas', component: BoletasComponent },
  { path: '**', redirectTo: 'dashboard' }
];

export default routes;                        // ✅ clave en Angular 20
