import React from 'react';
import { Stand } from '../../services/venueService';
import { VenueDetails } from '../../hooks/useVenueBuilder';
import { useTranslation } from 'react-i18next';
import './VenueWizard.css';

interface VenueReviewTabProps {
    details: VenueDetails;
    stands: Stand[];
    totalCapacity: number;
}

const VenueReviewTab: React.FC<VenueReviewTabProps> = ({ details, stands, totalCapacity }) => {
    const { t } = useTranslation();
    return (
        <div className="venue-review-tab-premium">
            <div className="review-header-premium">
                <h2>{t('venueWizard.inspectionReport')}</h2>
                <p>{t('venueWizard.validationDescription')}</p>
            </div>

            <div className="review-main-grid">
                {/* Summary Card */}
                <div className="summary-card-premium">
                    <div className="summary-badge">{t('venueWizard.officialRecord')}</div>
                    <div className="summary-title">{details.name || t('venueWizard.newVenue')}</div>
                    <div className="summary-location">{details.city}, {details.address}</div>

                    <div className="summary-stats">
                        <div className="sum-stat">
                            <div className="sum-val">{totalCapacity}</div>
                            <div className="sum-lab">{t('venueWizard.totalCapacityLabel')}</div>
                        </div>
                        <div className="sum-stat">
                            <div className="sum-val">{stands.length}</div>
                            <div className="sum-lab">{t('venueWizard.standsLabel')}</div>
                        </div>
                    </div>

                    <div className="summary-section-list">
                        <div className="sum-list-item">
                            <span>{t('venueWizard.sportLabel')}</span>
                            <strong>{details.sportName}</strong>
                        </div>
                        <div className="sum-list-item">
                            <span>{t('venueWizard.facilitiesLabel')}</span>
                            <strong>{details.facilities?.length || 0} {t('venueWizard.facilitiesCount')}</strong>
                        </div>
                        <div className="sum-list-item">
                            <span>{t('venueWizard.accessibilityLabel')}</span>
                            <strong>{details.accessibility?.length || 0} {t('venueWizard.accessibilityCount')}</strong>
                        </div>
                    </div>
                </div>

                {/* Blueprint Inspection View */}
                <div className="inspection-view-premium">
                    <label>{t('venueWizard.inspectionVisual')}</label>
                    <div className="mini-stadium-preview">
                        {/* Simple representation of the stadium */}
                        <div className="mini-field">
                            <div className="mini-pitch-lines"></div>
                        </div>
                        {stands.map(stand => (
                            <div
                                key={stand.id}
                                className={`mini-stand pos-${stand.position}`}
                                style={{ backgroundColor: stand.color }}
                            >
                                <span>{stand.totalCapacity}</span>
                            </div>
                        ))}
                    </div>
                    <div className="inspection-status-bar">
                        <div className="status-indicator success"></div>
                        <span>{t('venueWizard.structureValidated')}</span>
                    </div>
                </div>
            </div>

            <div className="review-gallery-row">
                <label>{t('venueWizard.mediaFiles')}</label>
                <div className="review-gallery-grid">
                    {details.photoUrl && <div className="gallery-item-review"><img src={details.photoUrl} alt="Main" /></div>}
                    {details.interiorPhotos?.map((url, i) => (
                        <div key={i} className="gallery-item-review"><img src={url} alt={`Interior ${i}`} /></div>
                    ))}
                </div>
            </div>

            <div className="publication-notice">
                <div className="notice-icon">🛡️</div>
                <div className="notice-text">
                    {t('venueWizard.publicationNotice')}
                </div>
            </div>
        </div>
    );
};

export default VenueReviewTab;
