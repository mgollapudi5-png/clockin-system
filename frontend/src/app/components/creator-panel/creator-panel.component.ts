import { Component, OnInit } from '@angular/core';
import { StoreAuthService } from '../../services/store-auth.service';
import { StoreManagementService } from '../../services/store-management.service';
import { StoreDTO, CreateStoreRequest } from '../../models/store.model';

@Component({
  selector: 'app-creator-panel',
  templateUrl: './creator-panel.component.html',
  styleUrls: ['./creator-panel.component.scss']
})
export class CreatorPanelComponent implements OnInit {
  activeTab: 'stores' | 'create' = 'stores';
  stores: StoreDTO[] = [];
  filteredStores: StoreDTO[] = [];
  searchTerm = '';
  filterStatus: 'all' | 'active' | 'inactive' = 'all';

  // Pagination
  currentPage = 1;
  pageSize = 10;

  // Create form
  newStore: CreateStoreRequest = { storeName: '', storeId: '', password: '', deviceLimit: 2, role: 'STORE_OWNER' };
  createLoading = false;
  createError = '';
  createSuccess = '';

  // Manage modal
  selectedStore: StoreDTO | null = null;
  showManageModal = false;
  newLimit = 2;
  newPassword = '';
  manageLoading = false;
  manageMessage = '';

  loading = false;
  error = '';

  creatorName = '';

  constructor(
    private storeAuthService: StoreAuthService,
    private storeManagementService: StoreManagementService
  ) {}

  ngOnInit(): void {
    this.creatorName = this.storeAuthService.getCreatorUser()?.storeName ?? 'Creator';
    this.loadStores();
  }

  loadStores(): void {
    this.loading = true;
    this.error = '';
    this.storeManagementService.getAllStores().subscribe({
      next: (stores) => {
        this.stores = stores;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load stores.';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    let result = this.stores;
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(s => s.storeName.toLowerCase().includes(term) || s.storeId.toLowerCase().includes(term));
    }
    if (this.filterStatus === 'active') result = result.filter(s => s.active);
    if (this.filterStatus === 'inactive') result = result.filter(s => !s.active);
    this.filteredStores = result;
    this.currentPage = 1;
  }

  get pagedStores(): StoreDTO[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredStores.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredStores.length / this.pageSize);
  }

  openManage(store: StoreDTO): void {
    this.selectedStore = { ...store };
    this.newLimit = store.deviceLimit;
    this.newPassword = '';
    this.manageMessage = '';
    this.showManageModal = true;
  }

  closeManage(): void {
    this.showManageModal = false;
    this.selectedStore = null;
  }

  resetSessions(): void {
    if (!this.selectedStore) return;
    if (!confirm('Reset all sessions for this store? Owner will need to login again.')) return;
    this.manageLoading = true;
    this.storeManagementService.resetSessions(this.selectedStore.id).subscribe({
      next: () => {
        this.manageMessage = 'Sessions reset successfully.';
        this.manageLoading = false;
        this.loadStores();
      },
      error: () => { this.manageMessage = 'Failed to reset sessions.'; this.manageLoading = false; }
    });
  }

  saveDeviceLimit(): void {
    if (!this.selectedStore) return;
    this.manageLoading = true;
    this.storeManagementService.changeDeviceLimit(this.selectedStore.id, this.newLimit).subscribe({
      next: (updated) => {
        this.manageMessage = 'Device limit updated.';
        this.manageLoading = false;
        this.loadStores();
        this.selectedStore = updated;
      },
      error: () => { this.manageMessage = 'Failed to update limit.'; this.manageLoading = false; }
    });
  }

  toggleActive(): void {
    if (!this.selectedStore) return;
    const action = this.selectedStore.active ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this store?`)) return;
    this.manageLoading = true;
    this.storeManagementService.toggleActive(this.selectedStore.id).subscribe({
      next: (updated) => {
        this.manageMessage = `Store ${action}d successfully.`;
        this.manageLoading = false;
        this.selectedStore = updated;
        this.loadStores();
      },
      error: () => { this.manageMessage = 'Failed to update store.'; this.manageLoading = false; }
    });
  }

  promoteToCreator(): void {
    if (!this.selectedStore) return;
    if (!confirm('Promote this store owner to CREATOR? This gives full admin access.')) return;
    this.manageLoading = true;
    this.storeManagementService.promoteToCreator(this.selectedStore.id).subscribe({
      next: (updated) => {
        this.manageMessage = 'Promoted to Creator successfully.';
        this.manageLoading = false;
        this.selectedStore = updated;
        this.loadStores();
      },
      error: () => { this.manageMessage = 'Failed to promote.'; this.manageLoading = false; }
    });
  }

  changePassword(): void {
    if (!this.selectedStore || !this.newPassword.trim()) return;
    if (!confirm('Change password and reset all sessions for this store?')) return;
    this.manageLoading = true;
    this.storeManagementService.changePassword(this.selectedStore.id, this.newPassword).subscribe({
      next: () => {
        this.manageMessage = 'Password changed and sessions reset.';
        this.newPassword = '';
        this.manageLoading = false;
        this.loadStores();
      },
      error: () => { this.manageMessage = 'Failed to change password.'; this.manageLoading = false; }
    });
  }

  createStore(): void {
    this.createError = '';
    this.createSuccess = '';
    this.createLoading = true;
    this.storeManagementService.createStore(this.newStore).subscribe({
      next: () => {
        this.createSuccess = `Store "${this.newStore.storeName}" created successfully!`;
        this.newStore = { storeName: '', storeId: '', password: '', deviceLimit: 2, role: 'STORE_OWNER' };
        this.createLoading = false;
        this.loadStores();
      },
      error: (err) => {
        this.createError = err?.error?.message || 'Failed to create store.';
        this.createLoading = false;
      }
    });
  }

  logout(): void {
    this.storeAuthService.logoutCreator();
  }
}
