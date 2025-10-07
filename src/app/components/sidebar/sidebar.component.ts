import { Component, HostListener } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  isCollapsed = false;
  isMobile = false;

  constructor(public authService: AuthService) {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    // En móviles, el sidebar empieza cerrado
    if (this.isMobile) {
      this.isCollapsed = true;
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  // Cerrar sidebar en móviles al hacer clic en un link
  onNavLinkClick() {
    if (this.isMobile) {
      this.isCollapsed = true;
    }
  }

  getUserRole(): string {
    const role = localStorage.getItem('role');
    const roleNames: { [key: string]: string } = {
      'admin': 'Administrador',
      'comercial': 'Comercial',
      'vendedor': 'Vendedor',
      'calidad': 'Calidad'
    };
    return roleNames[role || ''] || 'Usuario';
  }
}
