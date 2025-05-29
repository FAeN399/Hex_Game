import * as React from 'react';
const { useState, useEffect } = React;
import { useForgeStore } from './useForgeLogic';
import { 
  saveForgeConfiguration, 
  loadForgeConfiguration, 
  getAllSavedConfigurations, 
  deleteForgeConfiguration,
  exportForgeConfiguration,
  importForgeConfiguration
} from './forgePersistence';
import styles from './styles.module.css';

export interface ForgeConfigManagerProps {
  onConfigLoaded?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

interface SavedConfig {
  id: string;
  name: string;
  timestamp: number;
}

/**
 * UI component for managing forge configurations (save/load/delete)
 */
const ForgeConfigurationManager: React.FC<ForgeConfigManagerProps> = ({ 
  onConfigLoaded, 
  onError,
  className = ''
}) => {
  // Format timestamp for display
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };
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
  
  // Fetch all saved configurations
  const refreshConfigurations = () => {
    try {
      const configs = getAllSavedConfigurations();
      setConfigurations(configs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch configurations';
      onError?.(errorMessage);
    }
  };
  
  // Handle errors and notify parent if needed
  const handleError = (errorMessage: string): void => {
    console.error(errorMessage);
    if (onError) {
      onError(errorMessage);
    }
  };
  
  // Helper function to reset the modal state
  const resetModalState = () => {
    setConfigName('');
    setSelectedConfigId(null);
    setImportJson('');
  };
  
  // Open modal with specified mode
  const openModal = (mode: 'save' | 'load' | 'export' | 'import') => {
    setModalMode(mode);
    resetModalState();
    refreshConfigurations();
    setIsModalOpen(true);
  };
  
  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  // Handle save button click
  const handleSave = () => {
    if (configName.trim().length === 0) {
      onError?.('Please enter a name for your configuration');
      return;
    }

    try {
      saveForgeConfiguration(configName);
      setIsModalOpen(false);
      setConfigName('');
      refreshConfigurations();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save configuration';
      onError?.(errorMessage);
    }
  };
  
  // Handle load button click
  const handleLoad = () => {
    if (!selectedConfigId) {
      onError?.('Please select a configuration to load');
      return;
    }
    
    try {
      loadForgeConfiguration(selectedConfigId);
      setIsModalOpen(false);
      
      // Notify parent component
      if (onConfigLoaded) {
        onConfigLoaded();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load configuration';
      onError?.(errorMessage);
    }
  };
  
  // Handle delete button click for a specific configuration
  const handleDelete = (configId: string, event: React.MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation(); // Prevent triggering the load action
    try {
      deleteForgeConfiguration(configId);
      refreshConfigurations();
      // showMessage(`Configuration "${configId}" has been deleted`);
      
      // Reset selected config if we just deleted the selected one
      if (selectedConfigId === configId) {
        setSelectedConfigId(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete configuration';
      onError?.(errorMessage);
    }
  };
  
  // Handle export button click for a specific configuration
  const handleExport = (configId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the load action
    try {
      const jsonString = exportForgeConfiguration(configId);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `hexforge-config-${configId}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export configuration';
      onError?.(errorMessage);
    }
  };
  
  // Handler for import button
  const handleImport = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            if (event.target?.result) {
              const jsonString = event.target.result.toString();
              const configId = importForgeConfiguration(jsonString);
              loadForgeConfiguration(configId);
              setIsModalOpen(false);
              onConfigLoaded?.();
              refreshConfigurations();
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to import configuration';
            onError?.(errorMessage);
          }
        };
        reader.onerror = () => onError?.('Error reading file');
        reader.readAsText(file);
      };
      input.click();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import configuration';
      onError?.(errorMessage);
    }
  };
  
  // Check if there are placed cards in the forge
  const { placedCards } = useForgeStore();
  const hasPlacedCards = placedCards.some(card => card !== null);

  return (
    <div className={`${styles.configManager} ${className}`}>
      {/* Action buttons */}
      <div className={styles.configButtons}>
        <button 
          className={`${styles.configButton} ${styles.saveButton}`}
          onClick={() => openModal('save')}
          disabled={!hasPlacedCards}
          title={hasPlacedCards ? 'Save current forge configuration' : 'Place cards to enable saving'}
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
            <button className={styles.closeButton} onClick={() => setIsModalOpen(false)} aria-label="Close modal">
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfigName(e.target.value)}
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
                    onClick={() => setIsModalOpen(false)}
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
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            handleDelete(config.id, e);
                          }}
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
                    onClick={() => closeModal()}
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
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setImportJson(e.target.value)}
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
                    onClick={() => closeModal()}
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
