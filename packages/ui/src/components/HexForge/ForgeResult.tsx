import React, { FC } from 'react';
import { ForgeResultProps } from './types';
import styles from './styles.module.css';

/**
 * Component to display character stats and results from forge
 */
const ForgeResult: FC<ForgeResultProps> = ({
  placedCards,
  isComplete,
  characterStats
}) => {
  const filledSlots = placedCards.filter(card => card !== null).length;
  
  return (
    <div className={styles.statsPanel}>
      <h3 className={styles.statsHeader}>
        {isComplete ? 'Forged Character' : `Forge Progress (${filledSlots}/6)`}
      </h3>
      
      <div className={styles.statRow}>
        <span className={styles.statLabel}>Power</span>
        <span className={styles.statValue}>{characterStats.totalPower}</span>
      </div>
      
      <div className={styles.statRow}>
        <span className={styles.statLabel}>Attack</span>
        <span className={styles.statValue}>{characterStats.attack}</span>
      </div>
      
      <div className={styles.statRow}>
        <span className={styles.statLabel}>Defense</span>
        <span className={styles.statValue}>{characterStats.defense}</span>
      </div>
      
      <div className={styles.statRow}>
        <span className={styles.statLabel}>Speed</span>
        <span className={styles.statValue}>{characterStats.speed}</span>
      </div>
      
      <div className={styles.statRow}>
        <span className={styles.statLabel}>Magic</span>
        <span className={styles.statValue}>{characterStats.magic}</span>
      </div>
      
      {/* Display special abilities if any */}
      {characterStats.specialAbilities.length > 0 && (
        <>
          <h4 className={styles.statsHeader} style={{ fontSize: '1rem', marginTop: '10px' }}>
            Special Abilities
          </h4>
          <ul className={styles.abilitiesList}>
            {characterStats.specialAbilities.map((ability, index) => (
              <li key={index} className={styles.abilityItem}>
                {ability}
              </li>
            ))}
          </ul>
        </>
      )}
      
      {/* Forge button - disabled unless complete */}
      <div className={styles.forgeButtonContainer}>
        <button
          className={`${styles.forgeButton} ${isComplete ? styles.readyToForge : ''}`}
          disabled={!isComplete}
          aria-disabled={!isComplete}
        >
          {isComplete ? 'Create Character' : 'Incomplete Forge'}
        </button>
      </div>
    </div>
  );
};

export default ForgeResult;
