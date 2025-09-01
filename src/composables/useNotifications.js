/**
 * Composable for notification management
 */
import { ref } from 'vue';

export function useNotifications() {
  const notification = ref({ 
    show: false, 
    message: '', 
    type: 'info' 
  });

  // Show notification
  const showNotification = (message, type = 'info') => {
    notification.value = {
      show: true,
      message,
      type
    };
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      hideNotification();
    }, 5000);
  };

  // Hide notification
  const hideNotification = () => {
    notification.value.show = false;
  };

  // Show success notification
  const showSuccess = (message) => {
    showNotification(message, 'success');
  };

  // Show error notification
  const showError = (message) => {
    showNotification(message, 'error');
  };

  // Show warning notification
  const showWarning = (message) => {
    showNotification(message, 'warning');
  };

  // Show info notification
  const showInfo = (message) => {
    showNotification(message, 'info');
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    const iconMap = {
      success: 'icon-check',
      error: 'icon-error',
      warning: 'icon-warning',
      info: 'icon-info'
    };
    return iconMap[type] || 'icon-info';
  };

  return {
    // State
    notification,
    
    // Actions
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    getNotificationIcon
  };
}