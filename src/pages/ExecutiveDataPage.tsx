import { forwardRef } from 'react';
import { ASCII_EXECUTIVE } from '../constants/ascii-executive';
import { executiveDataByDimension, ctoData } from '../data/executiveMock';
import { BasicsSection, DeliverySection, QualitySection, CostSection } from '../components/exec';
import '../styles/executive.css';

interface ExecutiveDataPageProps {
  showMenu: boolean;
  onReplay: () => void;
  onBack: () => void;
}

export const ExecutiveDataPage = forwardRef<HTMLDivElement, ExecutiveDataPageProps>(
  ({ showMenu, onReplay, onBack }, ref) => {
    // Get all dimension entities
    const departmentEntities = executiveDataByDimension.department?.entities || [];
    const vendorEntities = executiveDataByDimension.vendor?.entities || [];
    const geoEntities = executiveDataByDimension.geo?.entities || [];

    return (
      <div
        ref={ref}
        className="exec-page fixed inset-0 overflow-y-auto"
        style={{ display: 'none', paddingTop: '56px', paddingBottom: '4rem' }}
      >
        {/* Header */}
        <div className="exec-header exec-container" style={{ opacity: 0, visibility: 'hidden' }}>
          <pre className="exec-ascii-title" style={{ color: 'var(--accent-success)' }}>
            {ASCII_EXECUTIVE}
          </pre>
          
          <div className="exec-header-box">
            <div className="exec-header-title">EXECUTIVE DASHBOARD</div>
            <div className="exec-header-subtitle">
              CTO: <span className="text-highlight">{ctoData.name}</span>
            </div>
            <div className="exec-header-subtitle">Engineering Performance Overview | Full Year 2025</div>
            <div className="exec-header-stats">
              <span>Total: <span className="text-highlight">{ctoData.headcount}</span></span>
              <span className="mx-4">|</span>
              <span>Employee: <span className="text-success">{ctoData.employeePct}%</span> ({Math.round(ctoData.headcount * ctoData.employeePct / 100)} FTE)</span>
              <span className="mx-4">|</span>
              <span>Contractor: <span className="text-warning">{ctoData.contractorPct}%</span> ({Math.round(ctoData.headcount * ctoData.contractorPct / 100)} vendor)</span>
            </div>
          </div>
        </div>

        {/* ═══════════════════ DIMENSION 1: DEPARTMENT ═══════════════════ */}
        <div className="exec-dimension exec-dimension-dept exec-module" style={{ opacity: 0, visibility: 'hidden' }}>
          <div className="exec-container">
            <div className="exec-dimension-header">
              <span className="exec-dimension-badge">DIMENSION 1</span>
              <span className="exec-dimension-title">BY DEPARTMENT</span>
              <span className="exec-dimension-desc">CTO's Direct Reports</span>
            </div>
          </div>
          
          <BasicsSection entities={departmentEntities} dimensionType="department" />
          <DeliverySection entities={departmentEntities} dimensionType="department" />
          <QualitySection entities={departmentEntities} dimensionType="department" />
          <CostSection entities={departmentEntities} dimensionType="department" />
        </div>

        {/* ═══════════════════ DIMENSION 2: VENDOR ═══════════════════ */}
        <div className="exec-dimension exec-dimension-vendor exec-module" style={{ opacity: 0, visibility: 'hidden' }}>
          <div className="exec-container">
            <div className="exec-dimension-header">
              <span className="exec-dimension-badge">DIMENSION 2</span>
              <span className="exec-dimension-title">BY VENDOR</span>
              <span className="exec-dimension-desc">SSC (Internal) + External Contractors</span>
            </div>
          </div>
          
          <BasicsSection entities={vendorEntities} dimensionType="vendor" />
          <DeliverySection entities={vendorEntities} dimensionType="vendor" />
          <QualitySection entities={vendorEntities} dimensionType="vendor" />
          <CostSection entities={vendorEntities} dimensionType="vendor" />
        </div>

        {/* ═══════════════════ DIMENSION 3: GEOGRAPHIC ═══════════════════ */}
        <div className="exec-dimension exec-dimension-geo exec-module" style={{ opacity: 0, visibility: 'hidden' }}>
          <div className="exec-container">
            <div className="exec-dimension-header">
              <span className="exec-dimension-badge">DIMENSION 3</span>
              <span className="exec-dimension-title">BY GEOGRAPHY</span>
              <span className="exec-dimension-desc">Team Distribution by Location</span>
            </div>
          </div>
          
          <BasicsSection entities={geoEntities} dimensionType="geo" />
          <DeliverySection entities={geoEntities} dimensionType="geo" />
          <QualitySection entities={geoEntities} dimensionType="geo" />
          <CostSection entities={geoEntities} dimensionType="geo" />
        </div>

        {/* Menu at bottom */}
        <div className="exec-menu-section exec-container" style={{ opacity: 0, visibility: 'hidden' }}>
          <pre className="exec-ascii-block" style={{ textAlign: 'center', color: 'var(--accent-success)' }}>
{`═══════════════════════════════════════════════════════════════════════════════
                              END OF REPORT                                    
═══════════════════════════════════════════════════════════════════════════════`}
          </pre>
          
          <div
            className="exec-menu"
            style={{
              opacity: showMenu ? 1 : 0,
              pointerEvents: showMenu ? 'auto' : 'none',
              visibility: showMenu ? 'visible' : 'hidden',
            }}
          >
            <span className="exec-menu-item" onClick={onReplay}>[R]eplay</span>
            <span className="exec-menu-divider">|</span>
            <span className="exec-menu-item">[D]ownload PDF</span>
            <span className="exec-menu-divider">|</span>
            <span className="exec-menu-item" onClick={onBack}>[B]ack to Menu</span>
          </div>

          <div className="exec-cursor">
            &gt; <span className="animate-pulse">_</span>
          </div>
        </div>
      </div>
    );
  }
);

ExecutiveDataPage.displayName = 'ExecutiveDataPage';
