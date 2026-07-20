export default function AgentDashboardBlock() {
  return (
    <div className="dash">
      <div className="section-label">
        <i className="ti ti-map-pin" aria-hidden="true" /> Grid point selection
        - wind analysis
      </div>
      <div className="grid-point-card">
        <div className="gp-icon">
          <i className="ti ti-map-pin" aria-hidden="true" />
        </div>
        <div className="gp-info">
          <div className="gp-title">
            ERA5 offshore grid point - selected by agent
          </div>
          <div className="gp-coords">24.35&deg;N, 54.60&deg;E</div>
          <div className="gp-meta">
            Nearest open-sea ERA5 node &middot; 28 km offshore from Musaffah Port
            &middot; Depth ~18 m &middot; Cleared ASCAT 25 km land mask &middot;
            Dominant Shamal (NW) fetch unobstructed
          </div>
          <div className="gp-tags">
            <span className="badge badge-success">
              <i className="ti ti-check" aria-hidden="true" /> Land mask OK
            </span>
            <span className="badge badge-success">
              <i className="ti ti-check" aria-hidden="true" /> ASCAT coverage
            </span>
            <span className="badge badge-accent">
              <i className="ti ti-wind" aria-hidden="true" /> Shamal fetch clear
            </span>
            <span className="badge badge-neutral">ERA5 0.25&deg; grid</span>
          </div>
        </div>
      </div>

      <div className="section-label">
        <i className="ti ti-robot" aria-hidden="true" /> Agentic workflow
      </div>
      <details className="expandable" open>
        <summary className="exp-header">
          <div className="exp-header-left">
            <i className="ti ti-list-check" aria-hidden="true" />
            <span className="exp-title">Step-by-step agentic pipeline</span>
            <span className="badge badge-accent">
              7 steps &middot; 2 awaiting input
            </span>
          </div>
          <i className="ti ti-chevron-down chevron" aria-hidden="true" />
        </summary>
        <div className="exp-body">
          <div className="workflow-steps">
            <div className="wf-step">
              <div className="wf-step-header">
                <div className="wf-step-num step-done">
                  <i className="ti ti-check" aria-hidden="true" />
                </div>
                <div className="wf-step-title">Grid point selection</div>
                <span className="badge badge-success">Done</span>
              </div>
              <div className="wf-step-desc">
                Agent evaluated 6 candidate ERA5 nodes. Selected 24.35&deg;N
                54.60&deg;E based on: minimum distance to coast &gt;25 km
                (ASCAT mask), Shamal NW fetch unobstructed, bathymetric depth
                &gt;10 m, lowest land contamination score.
              </div>
              <div className="human-input-box">
                <div className="human-label">
                  <i className="ti ti-user" aria-hidden="true" /> Human override
                  applied
                </div>
                <div className="agent-reply">
                  <i className="ti ti-check" aria-hidden="true" /> Accepted.
                  Re-ran selection with new anchor. All criteria still met at
                  24.35&deg;N 54.60&deg;E. Updated downstream grid references.
                </div>
              </div>
            </div>
            <div className="wf-step">
              <div className="wf-step-header">
                <div className="wf-step-num step-done">
                  <i className="ti ti-check" aria-hidden="true" />
                </div>
                <div className="wf-step-title">Data source selection</div>
                <span className="badge badge-success">Done</span>
              </div>
              <div className="wf-step-desc">
                Agent selected ERA5 (1979-2023) as primary wind source via CDS
                API. Proposed CMEMS WW3 for wave cross-check. ASCAT Metop-B/C
                (2013-2023) for validation.
              </div>
              <div className="human-input-box">
                <div className="human-label">
                  <i className="ti ti-user" aria-hidden="true" /> Human override
                  applied
                </div>
                <div className="agent-reply">
                  <i className="ti ti-check" aria-hidden="true" /> CFSR file
                  ingested. Collocated with ERA5 at grid point. Added as
                  secondary source in wind analysis. ERA5 remains primary for
                  EVA.
                </div>
              </div>
            </div>
            <div className="wf-step">
              <div className="wf-step-header">
                <div className="wf-step-num step-done">
                  <i className="ti ti-check" aria-hidden="true" />
                </div>
                <div className="wf-step-title">
                  ASCAT collocation &amp; validation split
                </div>
                <span className="badge badge-success">Done</span>
              </div>
              <div className="wf-step-desc">
                ASCAT L2 12.5 km coastal product downloaded for AOI
                24.0-24.8&deg;N, 54.2-55.0&deg;E. Land mask 25 km applied.
                4,821 collocated pairs extracted. Split: 2013-2020 -&gt; bias
                correction training, 2021-2023 -&gt; independent validation.
              </div>
            </div>
            <div className="wf-step">
              <div className="wf-step-header">
                <div className="wf-step-num step-done">
                  <i className="ti ti-check" aria-hidden="true" />
                </div>
                <div className="wf-step-title">Bias correction</div>
                <span className="badge badge-success">Done</span>
              </div>
              <div className="wf-step-desc">
                Sector-wise quantile mapping applied: NW (Shamal), SE (Gharbi),
                N, S sectors. ERA5 corrected wind speed passed to EVA pipeline.
                Correction functions stored for forecast post-processing.
              </div>
            </div>
            <div className="wf-step">
              <div className="wf-step-header">
                <div className="wf-step-num step-active">5</div>
                <div className="wf-step-title">Operability window analysis</div>
                <span className="badge badge-accent">Awaiting input</span>
              </div>
              <div className="wf-step-desc">
                Operational thresholds defined. Agent ready to compute workable
                weather windows.
              </div>
            </div>
            <div className="wf-step">
              <div className="wf-step-header">
                <div className="wf-step-num step-active">6</div>
                <div className="wf-step-title">Extreme value analysis</div>
                <span className="badge badge-accent">In progress</span>
              </div>
              <div className="wf-step-desc">
                Block maxima extracted (annual). GEV, Gumbel, and GPD fitted.
                Agent computed AIC/BIC for distribution selection. Preliminary
                return values generated - pending human review before
                finalisation.
              </div>
            </div>
            <div className="wf-step">
              <div className="wf-step-header">
                <div className="wf-step-num step-pending">7</div>
                <div className="wf-step-title">Report generation</div>
                <span className="badge badge-neutral">Pending</span>
              </div>
              <div className="wf-step-desc">
                Agent will compile all outputs into a structured metocean report
                aligned to ISO 19901-1 / DNV-RP-C205. Awaiting EVA sign-off in
                step 6.
              </div>
            </div>
          </div>
        </div>
      </details>

      <div className="grid2">
        <details className="expandable">
          <summary className="exp-header">
            <div className="exp-header-left">
              <i className="ti ti-shield-check" aria-hidden="true" />
              <span className="exp-title">Validations performed</span>
              <span className="badge badge-success">3 passed</span>
            </div>
            <i className="ti ti-chevron-down chevron" aria-hidden="true" />
          </summary>
          <div className="exp-body">
            <div className="val-item">
              <span className="badge badge-success">
                <i className="ti ti-check" aria-hidden="true" />
              </span>
              <div className="val-left">
                <div className="val-name">ASCAT wind speed validation</div>
                <div className="val-desc">
                  Holdout 2021-2023 &middot; N=1,847 pairs &middot; Bias -0.31
                  m/s &middot; RMSE 1.42 m/s &middot; SI 0.18 &middot; R&sup2;=0.91
                </div>
              </div>
            </div>
            <div className="val-item">
              <span className="badge badge-success">
                <i className="ti ti-check" aria-hidden="true" />
              </span>
              <div className="val-left">
                <div className="val-name">ASCAT wind direction validation</div>
                <div className="val-desc">
                  Sector-wise &middot; Shamal RMSE 14&deg; &middot; Gharbi RMSE
                  19&deg; &middot; Mean vector error 11&deg;
                </div>
              </div>
            </div>
            <div className="val-item">
              <span className="badge badge-success">
                <i className="ti ti-check" aria-hidden="true" />
              </span>
              <div className="val-left">
                <div className="val-name">Sentinel-6 wave Hs validation</div>
                <div className="val-desc">
                  N=342 altimeter passes &middot; Bias +0.06 m &middot; RMSE
                  0.21 m &middot; SI 0.22
                </div>
              </div>
            </div>
            <div className="val-item">
              <span className="badge badge-warning">
                <i className="ti ti-clock" aria-hidden="true" />
              </span>
              <div className="val-left">
                <div className="val-name">In-situ buoy validation</div>
                <div className="val-desc">
                  Pending - data request submitted to ADNOC. Will be
                  incorporated if provided within project window.
                </div>
              </div>
            </div>
          </div>
        </details>

        <details className="expandable">
          <summary className="exp-header">
            <div className="exp-header-left">
              <i className="ti ti-adjustments-horizontal" aria-hidden="true" />
              <span className="exp-title">Bias corrections</span>
              <span className="badge badge-accent">4 sectors</span>
            </div>
            <i className="ti ti-chevron-down chevron" aria-hidden="true" />
          </summary>
          <div className="exp-body">
            <div className="bc-item">
              <div className="bc-name">NW sector - Shamal (315&deg;-045&deg;)</div>
              <div className="bc-desc">
                Quantile mapping &middot; ERA5 underestimates by 0.8-1.2 m/s at
                upper quantiles &middot; Scale factor 1.09 at Q90 &middot;
                Training: 2013-2020
              </div>
            </div>
            <div className="bc-item">
              <div className="bc-name">SE sector - Gharbi (135&deg;-225&deg;)</div>
              <div className="bc-desc">
                Quantile mapping &middot; ERA5 overestimates at low-mid speeds
                due to Gulf thermal gradient &middot; Scale factor 0.94 at Q50
              </div>
            </div>
            <div className="bc-item">
              <div className="bc-name">N sector (045&deg;-135&deg;)</div>
              <div className="bc-desc">
                Linear correction &middot; Bias -0.2 m/s &middot; Low event
                frequency - sparse ASCAT pairs (N=312)
              </div>
            </div>
            <div className="bc-item">
              <div className="bc-name">S/SW sector (225&deg;-315&deg;)</div>
              <div className="bc-desc">
                Linear correction &middot; Bias +0.4 m/s &middot; Coastal fetch
                effects - caution on correction robustness
              </div>
            </div>
          </div>
        </details>

        <details className="expandable">
          <summary className="exp-header">
            <div className="exp-header-left">
              <i className="ti ti-certificate" aria-hidden="true" />
              <span className="exp-title">Standards applied</span>
              <span className="badge badge-neutral">5 references</span>
            </div>
            <i className="ti ti-chevron-down chevron" aria-hidden="true" />
          </summary>
          <div className="exp-body">
            <div className="std-item">
              <div className="std-code">ISO 19901-1:2015</div>
              <div className="std-desc">
                Metocean design and operating conditions for offshore structures
              </div>
            </div>
            <div className="std-item">
              <div className="std-code">DNV-RP-C205</div>
              <div className="std-desc">
                Environmental conditions and environmental loads
              </div>
            </div>
            <div className="std-item">
              <div className="std-code">NORSOK N-003</div>
              <div className="std-desc">
                Actions and action effects - extreme value methodology
              </div>
            </div>
            <div className="std-item">
              <div className="std-code">IEC 61400-3-1</div>
              <div className="std-desc">
                Offshore wind turbines - design requirements
              </div>
            </div>
            <div className="std-item">
              <div className="std-code">PIANC WG 49</div>
              <div className="std-desc">
                Harbour approach channels - design guidelines (wave operability)
              </div>
            </div>
          </div>
        </details>

        <details className="expandable">
          <summary className="exp-header">
            <div className="exp-header-left">
              <i className="ti ti-database" aria-hidden="true" />
              <span className="exp-title">Data sources</span>
              <span className="badge badge-neutral">5 sources</span>
            </div>
            <i className="ti ti-chevron-down chevron" aria-hidden="true" />
          </summary>
          <div className="exp-body">
            <div className="ds-row">
              <div className="ds-icon">
                <i className="ti ti-wind" aria-hidden="true" />
              </div>
              <div className="ds-info">
                <div className="ds-name">ERA5 reanalysis</div>
                <div className="ds-meta">
                  Wind, wave &middot; 0.25&deg; &middot; 1979-2023 &middot;
                  ECMWF CDS
                </div>
              </div>
              <span className="badge badge-accent">Primary</span>
            </div>
            <div className="ds-row">
              <div className="ds-icon">
                <i className="ti ti-satellite" aria-hidden="true" />
              </div>
              <div className="ds-info">
                <div className="ds-name">ASCAT Metop-B/C</div>
                <div className="ds-meta">
                  Wind speed + direction &middot; 12.5 km &middot; 2013-2023
                  &middot; EUMETSAT
                </div>
              </div>
              <span className="badge badge-success">Validation</span>
            </div>
            <div className="ds-row">
              <div className="ds-icon">
                <i className="ti ti-waves" aria-hidden="true" />
              </div>
              <div className="ds-info">
                <div className="ds-name">Sentinel-6 altimeter</div>
                <div className="ds-meta">
                  Hs only &middot; nadir &middot; 2021-2023 &middot; PODAAC
                </div>
              </div>
              <span className="badge badge-success">Wave valid.</span>
            </div>
            <div className="ds-row">
              <div className="ds-icon">
                <i className="ti ti-globe" aria-hidden="true" />
              </div>
              <div className="ds-info">
                <div className="ds-name">CMEMS WW3</div>
                <div className="ds-meta">
                  Wave &middot; 0.2&deg; &middot; 1993-2023 &middot;
                  Copernicus Marine
                </div>
              </div>
              <span className="badge badge-warning">Cross-check</span>
            </div>
            <div className="ds-row">
              <div className="ds-icon">
                <i className="ti ti-upload" aria-hidden="true" />
              </div>
              <div className="ds-info">
                <div className="ds-name">CFSR (user upload)</div>
                <div className="ds-meta">
                  Wind &middot; 0.5&deg; &middot; 2000-2010 &middot; Engineer
                  provided
                </div>
              </div>
              <span className="badge badge-neutral">Supplementary</span>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
