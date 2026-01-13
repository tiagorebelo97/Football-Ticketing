import React from 'react';
import { Stand } from '../../services/venueService';
import { VenueDetails } from '../../hooks/useVenueBuilder';
import './VenueWizard.css';

interface VenueReviewTabProps {
    details: VenueDetails;
    stands: Stand[];
    totalCapacity: number;
}

const VenueReviewTab: React.FC<VenueReviewTabProps> = ({ details, stands, totalCapacity }) => {
    return (
        <div className="venue-review-tab-premium">
            <div className="review-header-premium">
                <h2>Relatório de Inspeção Arquitetónica</h2>
                <p>Validação final da infraestrutura antes da publicação oficial.</p>
            </div>

            <div className="review-main-grid">
                {/* Summary Card */}
                <div className="summary-card-premium">
                    <div className="summary-badge">Official Record</div>
                    <div className="summary-title">{details.name || 'Nova Venue sem nome'}</div>
                    <div className="summary-location">{details.city}, {details.address}</div>

                    <div className="summary-stats">
                        <div className="sum-stat">
                            <div className="sum-val">{totalCapacity}</div>
                            <div className="sum-lab">Capacidade Total</div>
                        </div>
                        <div className="sum-stat">
                            <div className="sum-val">{stands.length}</div>
                            <div className="sum-lab">Bancadas</div>
                        </div>
                    </div>

                    <div className="summary-section-list">
                        <div className="sum-list-item">
                            <span>Desporto</span>
                            <strong>{details.sportName}</strong>
                        </div>
                        <div className="sum-list-item">
                            <span>Facilidades</span>
                            <strong>{details.facilities?.length || 0} Ativos</strong>
                        </div>
                        <div className="sum-list-item">
                            <span>Acessibilidade</span>
                            <strong>{details.accessibility?.length || 0} Ativos</strong>
                        </div>
                    </div>
                </div>

                {/* Blueprint Inspection View */}
                <div className="inspection-view-premium">
                    <label>Inspeção Visual (Blueprint 2D)</label>
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
                        <span>Estrutura validada pelo motor de arquitetura.</span>
                    </div>
                </div>
            </div>

            <div className="review-gallery-row">
                <label>Arquivos de Media Anexados</label>
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
                    Ao publicar, esta venue ficará disponível para a venda de bilhetes e gestão de eventos.
                    Pode continuar a editar a arquitetura no futuro, mas mudanças na capacidade podem afetar vendas em curso.
                </div>
            </div>
        </div>
    );
};

export default VenueReviewTab;
