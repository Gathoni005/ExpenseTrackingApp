import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController, ToastController } from '@ionic/angular';
import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonModal,
  IonSearchbar,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircleOutline, createOutline, ellipsisVertical, trashOutline } from 'ionicons/icons';
import { forkJoin } from 'rxjs';
import { AppEvent, EntityId, category } from 'src/app/interfaces/event';
import { Category } from 'src/app/services/category';
import { EventApi } from 'src/app/services/event-api';
import { MenuStateService } from 'src/app/services/menu-state.service';

// Register all icons used on this page (template + action sheet).
addIcons({ addCircleOutline, createOutline, ellipsisVertical, trashOutline });

type ToastColor = 'success' | 'danger';

interface EventEditForm {
  title: string;
  category: string;
  description: string;
  amount: number;
  serviceProvider: string;
  serviceProviderDetails: string;
}

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.page.html',
  styleUrls: ['./event-list.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonSearchbar,
    IonButton,
    IonAccordionGroup,
    IonAccordion,
    IonIcon,
    IonItem,
    IonLabel,
    IonModal,
    IonInput,
    CommonModule,
    FormsModule,
    AsyncPipe
  ]
})
export class EventListPage implements OnInit {
  // Full data from API.
  events: AppEvent[] = [];
  categories: category[] = [];

  // Search result list shown in UI.
  filteredEvents: AppEvent[] = [];
  searchText = '';

  // Edit modal state.
  isEditModalOpen = false;
  editingEvent: AppEvent | null = null;
  editForm: EventEditForm = this.createEmptyEditForm();

  private eventApi = inject(EventApi);
  private categoryService = inject(Category);
  private router = inject(Router);
  private actionSheetController = inject(ActionSheetController);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private menuStateService = inject(MenuStateService);

  // Lets the page hide menu button while sidebar is open.
  menuIsOpen$ = this.menuStateService.menuOpen$;

  ngOnInit() {
    this.loadInitialData();
  }

  ionViewWillEnter() {
    this.loadInitialData();
  }

  // Loads events and categories together because category names are used in event rows.
  private loadInitialData() {
    forkJoin({
      events: this.eventApi.getEvents(),
      categories: this.categoryService.getCategories()
    }).subscribe({
      next: ({ events, categories }) => {
        this.events = events;
        this.categories = categories;
        this.applyFilter();
      },
      error: (error) => {
        console.error('Failed to load event list data:', error);
      }
    });
  }

  // Search updates list in real time as user types.
  onSearchInput(event: CustomEvent) {
    this.searchText = String(event.detail?.value ?? '').trim().toLowerCase();
    this.applyFilter();
  }

  // Creates the list to display based on current search text.
  applyFilter() {
    if (!this.searchText) {
      this.filteredEvents = [...this.events];
      return;
    }

    this.filteredEvents = this.events.filter((event) => this.getSearchableText(event).includes(this.searchText));
  }

  private getSearchableText(event: AppEvent): string {
    return [
      event.title ?? '',
      this.getEventCategory(event),
      event.description ?? '',
      String(event.cost ?? ''),
      event.serviceProvider ?? '',
      String(event.serviceProviderDetails ?? ''),
      String(event.date ?? '')
    ]
      .join(' ')
      .toLowerCase();
  }

  goToAddEvent() {
    this.router.navigate(['/event-registration']);
  }

  trackByEventId(index: number, event: AppEvent) {
    return event.id ?? index;
  }

  // Stable accordion value to prevent open/close glitches.
  getAccordionValue(event: AppEvent): string {
    return event.id != null ? String(event.id) : this.getEventTitle(event);
  }

  getEventCategory(event: AppEvent): string {
    if (event.category?.trim()) {
      return event.category;
    }

    const categoryMatch = this.categories.find(
      (item) => item.id != null && event.categoryId != null && String(item.id) === String(event.categoryId)
    );

    return categoryMatch?.categoryName ?? 'N/A';
  }

  getEventTitle(event: AppEvent): string {
    return event.title?.trim() || event.description?.trim() || 'Event';
  }



  // Opens the 3-dot menu for one event row.
  async openEventActions(eventData: AppEvent, clickEvent: Event) {
    clickEvent.stopPropagation();
    clickEvent.preventDefault();

    const actionSheet = await this.actionSheetController.create({
      header: 'Event Options',
      buttons: [
        {
          text: 'Edit',
          icon: 'create-outline',
          handler: () => this.openEditModal(eventData)
        },
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash-outline',
          handler: () => this.confirmDelete(eventData)
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  // Fills edit form with current event values.
  openEditModal(eventData: AppEvent) {
    this.editingEvent = eventData;
    this.editForm = {
      title: eventData.title ?? '',
      category: this.getEventCategory(eventData),
      description: eventData.description ?? '',
      amount: Number(eventData.cost ?? 0),
      serviceProvider: eventData.serviceProvider ?? '',
      serviceProviderDetails: String(eventData.serviceProviderDetails ?? '')
    };
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.editingEvent = null;
    this.editForm = this.createEmptyEditForm();
  }

  async confirmCancelEdit() {
    const alert = await this.alertController.create({
      header: 'Discard changes?',
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Yes',
          role: 'destructive',
          handler: () => this.closeEditModal()
        }
      ]
    });
    await alert.present();
  }

  async confirmSaveEdit() {
    const alert = await this.alertController.create({
      header: 'Save Changes',
      message: 'Do you want to save these changes?',
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Yes',
          handler: () => this.saveEditedEvent()
        }
      ]
    });
    await alert.present();
  }

  // Saves edit, updates the list instantly, then refreshes from server.
  private saveEditedEvent() {
    const eventId = this.editingEvent?.id;
    if (eventId == null) {
      return;
    }

    const updatedEvent: AppEvent = {
      ...this.editingEvent,
      title: this.editForm.title.trim(),
      category: this.editForm.category.trim(),
      description: this.editForm.description.trim(),
      cost: Number(this.editForm.amount) || 0,
      serviceProvider: this.editForm.serviceProvider.trim(),
      serviceProviderDetails: this.editForm.serviceProviderDetails.trim()
    };

    this.eventApi.updateEvent(eventId, updatedEvent).subscribe({
      next: async () => {
        this.updateEventInMemory(updatedEvent);
        this.closeEditModal();
        await this.showToast('Event edited successfully.', 'success');
        this.refreshEventsFromServer();
      },
      error: async (error) => {
        console.error('Failed to update event:', error);
        await this.showToast('Event edit failed.', 'danger');
      }
    });
  }

  async confirmDelete(eventData: AppEvent) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this event?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.deleteEvent(eventData.id)
        }
      ]
    });
    await alert.present();
  }

  // Deletes event, removes it instantly from UI, then refreshes from server.
  private deleteEvent(eventId: EntityId | undefined) {
    if (eventId == null) {
      return;
    }

    this.eventApi.deleteEvent(eventId).subscribe({
      next: async () => {
        this.removeEventFromMemory(eventId);
        await this.showToast('Event deleted successfully.', 'success');
        this.refreshEventsFromServer();
      },
      error: async (error) => {
        console.error('Failed to delete event:', error);
        await this.showToast('Event delete failed.', 'danger');
      }
    });
  }

  private updateEventInMemory(updatedEvent: AppEvent) {
    this.events = this.events.map((event) => {
      if (event.id == null || updatedEvent.id == null) {
        return event;
      }
      return String(event.id) === String(updatedEvent.id) ? { ...event, ...updatedEvent } : event;
    });
    this.applyFilter();
  }

  private removeEventFromMemory(eventId: EntityId) {
    this.events = this.events.filter((event) => {
      if (event.id == null) {
        return true;
      }
      return String(event.id) !== String(eventId);
    });
    this.applyFilter();
  }

  // Server refresh keeps local list and db.json fully synchronized.
  private refreshEventsFromServer() {
    this.eventApi.getEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.applyFilter();
      },
      error: (error) => {
        console.error('Failed to refresh events:', error);
      }
    });
  }

  private createEmptyEditForm(): EventEditForm {
    return {
      title: '',
      category: '',
      description: '',
      amount: 0,
      serviceProvider: '',
      serviceProviderDetails: ''
    };
  }

  private async showToast(message: string, color: ToastColor) {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 1800,
      position: 'top'
    });
    await toast.present();
  }
}
