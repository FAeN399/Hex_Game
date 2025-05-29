import React, { FC, useState, useEffect, ChangeEvent } from 'react';
import { 
  saveForgeConfiguration, 
  loadForgeConfiguration, 
  getAllSavedConfigurations, 
  deleteForgeConfiguration,
  exportForgeConfiguration,
  importForgeConfiguration
} from './forgePersistence';
import styles from './styles.module.css';

interface ForgeConfigurationManagerProps {
  onConfigLoaded?: () => void;
  onError?: (error: string) => void;
}

interface SavedConfig {
  id: string;
  name: string;
  timestamp: number;
}

/**
 * UI component for managing forge configurations (save/load/delete)
 */
const ForgeConfigurationManager: FC<ForgeConfigurationManagerProps> = ({
  onConfigLoaded,
  onError
}) => {
  // State for configurations and UI controls
  const [configurations, setConfigurations] = useState<SavedConfig[]>([]);
  const [configName, setConfigName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'save' | 'load' | 'export' | 'import'>('save');
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [importJson, setImportJson] = useState<string>('');
  
  // Load configurations on mount
  useEffect(() => {
    refreshConfigurations();
  }, []);
  
  // Refresh the list of configurations from storage
  const refreshConfigurations = (): void => {
    try {
      const configs = getAllSavedConfigurations();
      setConfigurations(configs);
    } catch (error) {
      handleError(`Failed to load configurations: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Handle errors and notify parent if needed
  const handleError = (errorMessage: string): void => {
    console.error(errorMessage);
    if (onError) {
      onError(errorMessage);
    }
  };
  
  // Open modal for different operations
  const openModal = (mode: 'save' | 'load' | 'export' | 'import'): void => {
    setModalMode(mode);
    setIsModalOpen(true);
    
    // Reset form state
    setConfigName('');
    setSelectedConfigId(null);
    setImportJson('');
    
    // Refresh configurations when opening load/export modals
    if (mode === 'load' || mode === 'export') {
      refreshConfigurations();
    }
  };
  
  // Save current configuration
  const handleSave = (): void => {
    if (!configName.trim()) {
      handleError('Please enter a name for this configuration');
      return;
    }
    
    try {
      const id = saveForgeConfiguration(configName);
      refreshConfigurations();
      closeModal();
      
      // Show success notification
      // This would be replaced with a proper notification system
      console.log(`Configuration "${configName}" saved successfully!`);
    } catch (error) {
      handleError(`Failed to save configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Load selected configuration
  const handleLoad = (): void => {
    if (!selectedConfigId) {
      handleError('Please select a configuration to load');
      return;
    }
    
    try {
      loadForgeConfiguration(selectedConfigId);
      closeModal();
      
      // Notify parent component
      if (onConfigLoaded) {
        onConfigLoaded();
      }
      
      // Show success notification
      const config = configurations.find((c: SavedConfig) => c.id === selectedConfigId);
      console.log(`Configuration "${config?.name}" loaded successfully!`);
    } catch (error) {
      handleError(`Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Delete selected configuration
  const handleDelete = (id: string, event: React.MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation(); // Prevent selection when clicking delete
    
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        deleteForgeConfiguration(id);
        refreshConfigurations();
        
        // Show success notification
        console.log('Configuration deleted successfully!');
      } catch (error) {
        handleError(`Failed to delete configuration: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };
  
  // Export selected configuration
  const handleExport = (): void => {
    if (!selectedConfigId) {
      handleError('Please select a configuration to export');
      return;
    }
    
    try {
      const jsonData = exportForgeConfiguration(selectedConfigId);
      
      // Create a download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const config = configurations.find((c: SavedConfig) => c.id === selectedConfigId);
      
      a.href = url;
      a.download = `forge-config-${config?.name.replace(/\s+/g, '-').toLowerCase() || 'export'}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      closeModal();
    } catch (error) {
      handleError(`Failed to export configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Import configuration from JSON
  const handleImport = (): void => {
    if (!importJson.trim()) {
      handleError('Please paste a valid configuration JSON');
      return;
    }
    
    try {
      const id = importForgeConfiguration(importJson);
      refreshConfigurations();
      closeModal();
      
      // Show success notification
      console.log('Configuration imported successfully!');
    } catch (error) {
      handleError(`Failed to import configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Close the modal
  const closeModal = (): void => {
    setIsModalOpen(false);
  };
  
  // Format timestamp for display
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <div className={styles.configManager}>
      {/* Action buttons */}
      <div className={styles.configButtons}>
        <button 
          className={`${styles.configButton} ${styles.saveButton}`} 
          onClick={() => openModal('save')}
          aria-label="Save forge configuration"
        >
          Save Configuration
        </button>
        <button 
          className={`${styles.configButton} ${styles.loadButton}`} 
          onClick={() => openModal('load')}
          aria-label="Load forge configuration"
        >
          Load Configuration
        </button>
        <button 
          className={`${styles.configButton} ${styles.exportButton}`} 
          onClick={() => openModal('export')}
          aria-label="Export forge configuration"
        >
          Export
        </button>
        <button 
          className={`${styles.configButton} ${styles.importButton}`} 
          onClick={() => openModal('import')}
          aria-label="Import forge configuration"
        >
          Import
        </button>
      </div>
      
      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeButton} onClick={closeModal} aria-label="Close modal">
              &times;
            </button>
            
            <h3 className={styles.modalTitle}>
              {modalMode === 'save' && 'Save Configuration'}
              {modalMode === 'load' && 'Load Configuration'}
              {modalMode === 'export' && 'Export Configuration'}
              {modalMode === 'import' && 'Import Configuration'}
            </h3>
            
            {/* Save form */}
            {modalMode === 'save' && (
              <div className={styles.modalContent}>
                <div className={styles.formGroup}>
                  <label htmlFor="config-name">Configuration Name:</label>
                  <input
                    id="config-name"
                    type="text"
                    value={configName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setConfigName(e.target.value)}
                    placeholder="Enter a name for this configuration"
                    className={styles.textInput}
                  />
                </div>
                <div className={styles.modalActions}>
                  <button 
                    className={`${styles.configButton} ${styles.saveButton}`}
                    onClick={handleSave}
                    disabled={!configName.trim()}
                  >
                    Save
                  </button>
                  <button 
                    className={styles.configButton}
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {/* Load/Export configuration list */}
            {(modalMode === 'load' || modalMode === 'export') && (
              <div className={styles.modalContent}>
                {configurations.length > 0 ? (
                  <div className={styles.configList}>
                    {configurations.map(config => (
                      <div 
                        key={config.id}
                        className={`${styles.configItem} ${selectedConfigId === config.id ? styles.selected : ''}`}
                        onClick={() => setSelectedConfigId(config.id)}
                      >
                        <div className={styles.configInfo}>
                          <div className={styles.configName}>{config.name}</div>
                          <div className={styles.configDate}>{formatDate(config.timestamp)}</div>
                        </div>
                        <button 
                          className={styles.deleteButton}
                          onClick={(e) => handleDelete(config.id, e)}
                          aria-label="Delete this configuration"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyMessage}>No saved configurations found.</p>
                )}
                
                <div className={styles.modalActions}>
                  <button 
                    className={`${styles.configButton} ${modalMode === 'load' ? styles.loadButton : styles.exportButton}`}
                    onClick={modalMode === 'load' ? handleLoad : handleExport}
                    disabled={!selectedConfigId}
                  >
                    {modalMode === 'load' ? 'Load' : 'Export'}
                  </button>
                  <button 
                    className={styles.configButton}
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {/* Import form */}
            {modalMode === 'import' && (
              <div className={styles.modalContent}>
                <div className={styles.formGroup}>
                  <label htmlFor="import-json">Paste Configuration JSON:</label>
                  <textarea
                    id="import-json"
                    value={importJson}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setImportJson(e.target.value)}
                    placeholder="Paste the exported JSON configuration here"
                    className={styles.textArea}
                    rows={10}
                  />
                </div>
                <div className={styles.modalActions}>
                  <button 
                    className={`${styles.configButton} ${styles.importButton}`}
                    onClick={handleImport}
                    disabled={!importJson.trim()}
                  >
                    Import
                  </button>
                  <button 
                    className={styles.configButton}
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgeConfigurationManager;
