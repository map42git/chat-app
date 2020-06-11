import { NgModule } from "@angular/core";

import { Routes, RouterModule } from "@angular/router";
import { ChatComponent } from './components/chat/chat.component';
import { LoginGuard } from './guards/login.guard';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: ChatComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'console',
    component: AdminPanelComponent,
    canActivate: [LoginGuard]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
