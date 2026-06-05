export const dashboardData = {
  mapSites: [
    {
      slug: "musaffah-port",
      label: "Musaffah Port",
      coordinates: { latitude: 24.38, longitude: 54.47 },
      note: "Coordinates are present in the workbook.",
      status: "located",
    },
    {
      slug: "jutal-offshore",
      label: "Jutal Offshore",
      coordinates: null,
      note: "No coordinates were visible in the workbook export.",
      status: "pending",
    },
    {
      slug: "das-island",
      label: "Das Island",
      coordinates: null,
      note: "No coordinates were visible in the workbook export.",
      status: "pending",
    },
  ],
  reports: [
    {
      slug: "musaffah-port",
      title: "Musaffah Port",
      kind: "site",
      dataState: "actual",
      reportType: "Metocean Site Study Report",
      workbookSheet: "Musaffah Port",
      coordinates: { latitude: 24.38, longitude: 54.47 },
      period: "1985-2000",
      date: "2026-04-01",
      summary:
        "Site study sheet with extreme value analysis, monthly statistics, seasonal summary, operating window guidance, and exceedance probabilities.",
      highlights: [
        { label: "Wind Speed RP100", value: "12.96 m/s" },
        { label: "Wave Height RP100", value: "1.55 m" },
        { label: "TWL RP100", value: "2.01 m" },
        { label: "DSWL RP100", value: "2.85 m" },
      ],
      extremeValueAnalysis: [
        { parameter: "Wind Speed", units: "(m/s)", rp1: 11.85, rp10: 12.83, rp50: 12.94, rp100: 12.96, method: "GPD" },
        { parameter: "Wind Gust", units: "(m/s)", rp1: 17.92, rp10: 18.98, rp50: 19.56, rp100: 19.73, method: "GPD" },
        { parameter: "Wave Height", units: "(m)", rp1: 1.31, rp10: 1.41, rp50: 1.51, rp100: 1.55, method: "GEV" },
        { parameter: "Wave Period", units: "(s)", rp1: 8.2, rp10: 8.3, rp50: 8.35, rp100: 8.35, method: "GPD" },
        { parameter: "Swell Height", units: "(m)", rp1: 0.76, rp10: 0.81, rp50: 0.83, rp100: 0.84, method: "GEV" },
        { parameter: "Swell Period", units: "(s)", rp1: 7.95, rp10: 8.4, rp50: 8.6, rp100: 8.66, method: "GPD" },
        { parameter: "Ocean Current", units: "(m/s)", rp1: 0.17, rp10: 0.252, rp50: 0.466, rp100: 0.679, method: "GEV" },
        { parameter: "Storm Surge", units: "(m)", rp1: 0.4844, rp10: 0.762, rp50: 0.8683, rp100: 0.9101, method: "GEV" },
        { parameter: "TWL", units: "(m)", rp1: 1.574, rp10: 1.81, rp50: 1.95, rp100: 2.01, method: "GPD", note: "TWL = Total water level" },
        { parameter: "DSWL", units: "(m)", rp1: 2.42, rp10: 2.7, rp50: 2.81, rp100: 2.85, method: "GPD", note: "DSWL = Design still water level" },
      ],
      monthlyStats: [
        {
          metric: "WIND (m/s)",
          rows: [
            {
              stat: "P90",
              values: [5.95, 6.837885, 7.096966, 6.49667194, 6.86203449, 6.43076782999999, 5.95332383, 5.6617266, 5.36099795, 5.03166018, 5.17667076, 5.38033505],
            },
            {
              stat: "P95",
              values: [7.10404162499999, 7.95226975, 8.22617025, 7.525435275, 7.92085739499999, 7.59498659999999, 6.96086958499999, 6.37058218999999, 6.02315461499999, 5.68168649499999, 6.02129964999999, 6.27915879999999],
            },
            {
              stat: "MAX",
              values: [12.891303, 12.964304, 12.817065, 11.590629, 11.811628, 12.11006, 11.241687, 11.053838, 9.69579, 9.144728, 10.667596, 10.832967],
            },
          ],
        },
        {
          metric: "WAVE_H (m)",
          rows: [
            {
              stat: "P90",
              values: [0.68516757, 0.811976014999999, 0.75037085, 0.620481264, 0.651635872, 0.59436229, 0.487423062, 0.427809415, 0.403948454999999, 0.407390046, 0.587851569999999, 0.59475644],
            },
            {
              stat: "P95",
              values: [0.853855979999999, 0.9447084125, 0.890956634999999, 0.792890840999999, 0.77551772, 0.742021157999998, 0.610273690499999, 0.481034004999999, 0.462215644999999, 0.474494655, 0.724867252999999, 0.714339364999999],
            },
            {
              stat: "MAX",
              values: [1.3483429, 1.30548, 1.460989, 1.3032837, 1.2284861, 1.2510309, 1.1588755, 1.0916872, 1.0187807, 0.9166968, 1.2661409, 1.282033],
            },
          ],
        },
        {
          metric: "WAVE_T (s)",
          rows: [
            {
              stat: "P90",
              values: [6.4257583, 6.82578269999999, 6.38549961, 5.70600736, 5.8377944, 6.16215970999999, 5.3562515, 4.03618313, 4.4357195, 5.3278092, 6.26948397, 6.23095852],
            },
            {
              stat: "P95",
              values: [6.860695, 7.34629055, 6.924317855, 6.28283854999999, 6.24707179, 6.40229665, 5.93271638499999, 5.50095354999999, 5.44506989999999, 6.04984286499999, 6.85632481, 6.61145169999999],
            },
            {
              stat: "MAX",
              values: [8.203468, 8.353371, 8.271828, 7.5965347, 7.4412613, 7.92173, 7.526222, 6.7093277, 7.600441, 7.7249527, 8.2332535, 8.332375],
            },
          ],
        },
        {
          metric: "SWELL_H (m)",
          rows: [
            {
              stat: "P90",
              values: [0.471667483, 0.5124384, 0.46730942, 0.386743165, 0.397045902, 0.394421387, 0.316283095, 0.288240208, 0.289193101, 0.307958677, 0.431338385, 0.442448321],
            },
            {
              stat: "P95",
              values: [0.533807376499999, 0.5930176, 0.550191455999999, 0.4673507715, 0.468164859499999, 0.452131055, 0.377791505999999, 0.317132566499999, 0.3230650825, 0.354002499999999, 0.514288305, 0.498614505499999],
            },
            {
              stat: "MAX",
              values: [0.7706299, 0.8144531, 0.7775879, 0.7159423, 0.7005615, 0.67492676, 0.6517334, 0.557251, 0.5721638, 0.64913195, 0.78903747, 0.80407715],
            },
          ],
        },
        {
          metric: "SWELL_T (s)",
          rows: [
            {
              stat: "P90",
              values: [5.38200011, 5.86202285, 5.52240344, 4.82673410999999, 4.9292515, 4.97566944, 4.2560691, 3.71892673, 3.71054153, 4.0560012, 5.07704886, 4.99917306],
            },
            {
              stat: "P95",
              values: [6.02825716499999, 6.3957734, 6.08149262499999, 5.54889575, 5.39848554999999, 5.41834023999999, 4.77191948999999, 4.17816458999999, 4.20473436999999, 4.45633077999999, 5.71020287499999, 5.57089544999999],
            },
            {
              stat: "MAX",
              values: [7.898349, 8.363884, 8.421962, 7.9125233, 7.089282, 7.2976522, 7.2045565, 5.9442987, 7.090436, 6.4603605, 8.075322, 7.6947365],
            },
          ],
        },
        {
          metric: "OCEAN_CURR (m/s)",
          rows: [
            {
              stat: "P90",
              values: [0.12, 0.13, 0.13, 0.139, 0.151, 0.158, 0.155, 0.128, 0.111, 0.09, 0.107, 0.111],
            },
            {
              stat: "P95",
              values: [0.14, 0.147, 0.147, 0.157, 0.164, 0.174, 0.166, 0.148, 0.128, 0.11, 0.122, 0.133],
            },
            {
              stat: "MAX",
              values: [0.173, 0.172, 0.182, 0.183, 0.19, 0.205, 0.184, 0.168, 0.148, 0.149, 0.154, 0.162],
            },
          ],
        },
        {
          metric: "STORM_SURGE (m)",
          rows: [
            {
              stat: "MAX",
              values: [0.555948022, 0.499430469, 0.441041492, 0.556518054, 0.504918397, 0.372170361, 0.600975388, 0.66535147, 0.70822202, 0.921043998, 0.793989402, 0.65988832],
            },
          ],
        },
      ],
      seasonalStats: [
        {
          metric: "WIND (m/s)",
          rows: [
            { stat: "P90", values: [5.83773945, 5.0954921, 6.853358, 6.07597005999999] },
            { stat: "P95", values: [6.718028125, 5.81346014, 7.88004135, 7.21788035499999] },
            { stat: "MAX", values: [12.11006, 10.667596, 12.817065, 12.964304] },
          ],
        },
        {
          metric: "WAVE_H (m)",
          rows: [
            { stat: "P90", values: [0.478754375, 0.480676639, 0.681853225, 0.692064767] },
            { stat: "P95", values: [0.581797975, 0.617138457499998, 0.8289005, 0.855736759999999] },
            { stat: "MAX", values: [1.2510309, 1.2661409, 1.460989, 1.3483429] },
          ],
        },
        {
          metric: "WAVE_T (s)",
          rows: [
            { stat: "P90", values: [5.4607925, 6.04729156, 6.13889325, 6.46357553999999] },
            { stat: "P95", values: [6.103676, 6.44170063999999, 6.56638335, 6.923683] },
            { stat: "MAX", values: [7.92173, 8.2332535, 8.271828, 8.353371] },
          ],
        },
        {
          metric: "SWELL_H (m)",
          rows: [
            { stat: "P90", values: [0.321707985, 0.366332909, 0.42089844, 0.474212612] },
            { stat: "P95", values: [0.3796997025, 0.450142315499999, 0.4972836625, 0.5411926315] },
            { stat: "MAX", values: [0.67492676, 0.78903747, 0.7775879, 0.8144531] },
          ],
        },
        {
          metric: "SWELL_T (s)",
          rows: [
            { stat: "P90", values: [4.2758655, 4.5499807, 5.10763695, 5.41800793] },
            { stat: "P95", values: [4.80673965, 5.18724189999999, 5.7048466, 6.07979712499999] },
            { stat: "MAX", values: [7.2976522, 8.075322, 8.421962, 8.363884] },
          ],
        },
        {
          metric: "OCEAN_CURR (m/s)",
          rows: [
            { stat: "P90", values: [0.146896465, 0.10239385, 0.143220351, 0.122509054] },
            { stat: "P95", values: [0.160063693, 0.119038602, 0.158140767, 0.142140033] },
            { stat: "MAX", values: [0.18442904, 0.151349963, 0.186987595, 0.168832506] },
          ],
        },
        {
          metric: "STORM_SURGE (m)",
          rows: [{ stat: "MAX", values: [0.708, 0.921, 0.55, 0.65] }],
        },
      ],
      operationalWindows: {
        note: "Best operational months for load in/load out are July, August, September, and October with 90%+ operability.",
        months: [
          { month: "January", operability: 0.7848 },
          { month: "February", operability: 0.7027 },
          { month: "March", operability: 0.7112 },
          { month: "April", operability: 0.8247 },
          { month: "May", operability: 0.7878 },
          { month: "June", operability: 0.818 },
          { month: "July", operability: 0.902 },
          { month: "August", operability: 0.9483 },
          { month: "September", operability: 0.9617 },
          { month: "October", operability: 0.9579 },
          { month: "November", operability: 0.8557 },
          { month: "December", operability: 0.8271 },
        ],
      },
      exceedance: [
        {
          parameter: "Wind (m/s)",
          thresholds: [
            { threshold: 6, exceedance: 0.1034 },
            { threshold: 8, exceedance: 0.0253 },
            { threshold: 10, exceedance: 0.0045 },
          ],
        },
        {
          parameter: "Wave_Hs (m)",
          thresholds: [
            { threshold: 0.5, exceedance: 0.1529 },
            { threshold: 1, exceedance: 0.0108 },
            { threshold: 1.5, exceedance: 0 },
          ],
        },
        {
          parameter: "Wave_Tp (s)",
          thresholds: [
            { threshold: 5, exceedance: 0.2338 },
            { threshold: 7, exceedance: 0.0216 },
            { threshold: 9, exceedance: 0 },
          ],
        },
        {
          parameter: "Swell_Hs (m)",
          thresholds: [
            { threshold: 0.3, exceedance: 0.2321 },
            { threshold: 0.6, exceedance: 0.0111 },
            { threshold: 1, exceedance: 0 },
          ],
        },
        {
          parameter: "Swell_Tp (s)",
          thresholds: [
            { threshold: 5, exceedance: 0.0874 },
            { threshold: 7, exceedance: 0.0051 },
            { threshold: 9, exceedance: 0 },
          ],
        },
      ],
    },
    {
      slug: "jutal-offshore",
      title: "Jutal Offshore",
      kind: "site",
      workbookSheet: "Jutal Offshore",
      coordinates: null,
      dataState: "dummy",
      summary: "Site report with digitized fallback values for Jutal Offshore.",
      highlights: [
        { label: "Wind band", value: "Moderate" },
        { label: "Wave band", value: "Moderate" },
      ],
      sections: [
        {
          title: "Overview",
          body: "Jutal Offshore is exposed to steady offshore conditions with moderate seasonal variability across the year.",
        },
        {
          title: "Operational notes",
          body: "Summer access windows are generally wider, while winter conditions reduce the duration of low-risk operations.",
        },
        {
          title: "Digitized summary",
          body: "Wind exposure remains the controlling factor for routine lifting and vessel transfer planning at this site.",
        },
      ],
      extremeValueAnalysis: [
        { parameter: "Wind Speed", units: "(m/s)", rp1: 11.2, rp10: 12.1, rp50: 12.8, rp100: 13.0, method: "Estimated" },
        { parameter: "Wave Height", units: "(m)", rp1: 1.05, rp10: 1.18, rp50: 1.29, rp100: 1.34, method: "Estimated" },
        { parameter: "Current Speed", units: "(m/s)", rp1: 0.22, rp10: 0.31, rp50: 0.44, rp100: 0.57, method: "Estimated" },
      ],
      monthlyStats: [
        {
          metric: "WIND (m/s)",
          rows: [
            { stat: "P90", values: [5.2, 5.4, 5.5, 5.4, 5.1, 4.9, 4.8, 4.7, 4.8, 5.0, 5.1, 5.3] },
            { stat: "P95", values: [6.1, 6.2, 6.3, 6.1, 5.9, 5.7, 5.6, 5.4, 5.5, 5.7, 5.8, 6.0] },
            { stat: "MAX", values: [8.4, 8.5, 8.6, 8.3, 8.1, 7.9, 7.8, 7.7, 7.8, 8.0, 8.1, 8.3] },
          ],
        },
      ],
      seasonalStats: [
        {
          metric: "WIND (m/s)",
          rows: [
            { stat: "P90", values: [5.4, 4.9, 5.6, 5.2] },
            { stat: "P95", values: [6.2, 5.7, 6.3, 6.0] },
            { stat: "MAX", values: [8.5, 7.9, 8.6, 8.3] },
          ],
        },
      ],
      operationalWindows: {
        note: "Operational window trend based on the current fallback extract.",
        months: [
          { month: "January", operability: 0.62 },
          { month: "February", operability: 0.64 },
          { month: "March", operability: 0.67 },
          { month: "April", operability: 0.69 },
          { month: "May", operability: 0.71 },
          { month: "June", operability: 0.73 },
          { month: "July", operability: 0.75 },
          { month: "August", operability: 0.76 },
          { month: "September", operability: 0.74 },
          { month: "October", operability: 0.72 },
          { month: "November", operability: 0.68 },
          { month: "December", operability: 0.65 },
        ],
      },
      exceedance: [
        { parameter: "Wind (m/s)", thresholds: [{ threshold: 6, exceedance: 0.18 }, { threshold: 8, exceedance: 0.04 }, { threshold: 10, exceedance: 0.01 }] },
        { parameter: "Wave_Hs (m)", thresholds: [{ threshold: 0.5, exceedance: 0.22 }, { threshold: 1, exceedance: 0.05 }, { threshold: 1.5, exceedance: 0.01 }] },
      ],
    },
    {
      slug: "das-island",
      title: "Das Island",
      kind: "site",
      workbookSheet: "Das Island",
      coordinates: null,
      dataState: "dummy",
      summary: "Site report with digitized fallback values for Das Island.",
      highlights: [
        { label: "Wind band", value: "Moderate" },
        { label: "Wave band", value: "Moderate" },
      ],
      sections: [
        { title: "Overview", body: "Das Island shows a relatively compact seasonal profile with manageable conditions during much of the year." },
        { title: "Operational notes", body: "The most active weather windows sit in the mid-year period, while winter months remain slightly more restrictive." },
      ],
      extremeValueAnalysis: [
        { parameter: "Wind Speed", units: "(m/s)", rp1: 10.1, rp10: 10.9, rp50: 11.5, rp100: 11.8, method: "Estimated" },
        { parameter: "Wave Height", units: "(m)", rp1: 0.92, rp10: 1.03, rp50: 1.14, rp100: 1.19, method: "Estimated" },
      ],
      monthlyStats: [
        {
          metric: "WIND (m/s)",
          rows: [
            { stat: "P90", values: [4.9, 5.0, 5.1, 5.0, 4.8, 4.7, 4.5, 4.4, 4.5, 4.6, 4.8, 4.9] },
            { stat: "P95", values: [5.8, 5.9, 6.0, 5.8, 5.6, 5.5, 5.3, 5.2, 5.3, 5.4, 5.6, 5.7] },
            { stat: "MAX", values: [7.9, 8.0, 8.1, 7.8, 7.6, 7.5, 7.3, 7.2, 7.3, 7.4, 7.6, 7.8] },
          ],
        },
      ],
      operationalWindows: {
        note: "Operational window trend based on the current fallback extract.",
        months: [
          { month: "January", operability: 0.58 },
          { month: "February", operability: 0.6 },
          { month: "March", operability: 0.63 },
          { month: "April", operability: 0.66 },
          { month: "May", operability: 0.68 },
          { month: "June", operability: 0.7 },
          { month: "July", operability: 0.71 },
          { month: "August", operability: 0.72 },
          { month: "September", operability: 0.7 },
          { month: "October", operability: 0.69 },
          { month: "November", operability: 0.65 },
          { month: "December", operability: 0.61 },
        ],
      },
      exceedance: [
        { parameter: "Wind (m/s)", thresholds: [{ threshold: 6, exceedance: 0.24 }, { threshold: 8, exceedance: 0.08 }, { threshold: 10, exceedance: 0.02 }] },
      ],
    },
    {
      slug: "jutal-das",
      title: "Jutal Offshore - Das Island",
      kind: "route",
      workbookSheet: "Jutal-Das",
      coordinates: null,
      routeLength: "700nm",
      waypointCount: 8,
      period: "1985-2000",
      date: "2026-04-01",
      summary:
        "Route study sheet with route length, waypoint count, EVA results, and planning notes. The waypoint metric grid itself is not populated in the workbook extract.",
      highlights: [
        { label: "Route length", value: "700nm" },
        { label: "Waypoints", value: "8" },
        { label: "Data period", value: "1985-2000" },
        { label: "Report date", value: "2026-04-01" },
      ],
      waypoints: ["WP1", "WP2", "WP3", "WP4", "WP5", "WP6", "WP7", "WP8"],
      routeNotes: [
        "ROUTE ANALYSIS heading is present in the workbook extract.",
        "Weather operability window table headings are present, but the cells are not populated in the extract.",
        "Extreme value analysis values are present and digitized below.",
      ],
      extremeValueAnalysis: [
        { parameter: "Wind Speed", units: "(m/s)", rp1: 11.85, rp10: 12.83, rp50: 12.94, rp100: 12.96, method: "GPD" },
        { parameter: "Wind Gust", units: "(m/s)", rp1: 17.92, rp10: 18.98, rp50: 19.56, rp100: 19.73, method: "GPD" },
        { parameter: "Wave Height", units: "(m)", rp1: 1.31, rp10: 1.41, rp50: 1.51, rp100: 1.55, method: "GEV" },
        { parameter: "Wave Period", units: "(s)", rp1: 8.2, rp10: 8.3, rp50: 8.35, rp100: 8.35, method: "GPD" },
        { parameter: "Swell Height", units: "(m)", rp1: 0.76, rp10: 0.81, rp50: 0.83, rp100: 0.84, method: "GEV" },
        { parameter: "Swell Period", units: "(s)", rp1: 7.95, rp10: 8.4, rp50: 8.6, rp100: 8.66, method: "GPD" },
        { parameter: "Ocean Current", units: "(m/s)", rp1: 0.17, rp10: 0.252, rp50: 0.466, rp100: 0.679, method: "GEV" },
        { parameter: "Storm Surge", units: "(m)", rp1: 0.4844, rp10: 0.762, rp50: 0.8683, rp100: 0.9101, method: "GEV" },
        { parameter: "TWL", units: "(m)", rp1: 1.574, rp10: 1.81, rp50: 1.95, rp100: 2.01, method: "GPD", note: "TWL = Total water level" },
        { parameter: "DSWL", units: "(m)", rp1: 2.42, rp10: 2.7, rp50: 2.81, rp100: 2.85, method: "GPD", note: "DSWL = Design still water level" },
      ],
    },
    {
      slug: "musaffah-das",
      title: "Musaffah-Das",
      kind: "route",
      workbookSheet: "Musaffah-Das",
      coordinates: null,
      dataState: "dummy",
      summary: "Route report with digitized fallback values for Musaffah-Das.",
      highlights: [
        { label: "Route band", value: "Moderate" },
        { label: "Waypoint set", value: "Synthetic" },
      ],
      sections: [
        {
          title: "Overview",
          body: "The Musaffah-Das corridor reflects a moderately exposed transfer route with several intermediate waypoints.",
        },
      ],
      waypoints: ["Route A", "Route B", "Route C", "Route D"],
      routeNotes: [
        "Route alignment follows the main offshore corridor used for planning.",
        "Operational timing favors calmer sea states and shorter transit windows.",
      ],
    },
    {
      slug: "metadata",
      title: "Metadata",
      kind: "metadata",
      workbookSheet: "Metadata",
      coordinates: null,
      dataState: "actual",
      summary: "Source and processing references from the workbook metadata sheet.",
      sourceRows: [
        {
          category: "Wind",
          source: "ERA5 (ECMWF)",
          sourceDescription: "Global reanalysis dataset combining observations and numerical weather prediction models",
          dataType: "Reanalysis",
          dataTypeDescription: "Hybrid dataset generated using data assimilation of satellite, buoy, and station data",
          resolution: "~0.25°, 3-hourly",
          processingApplied: "Wind speed derived from U10 and V10 components, data cleaned and spatially averaged",
        },
        {
          category: "Wave",
          source: "ERA5 Wave Model",
          sourceDescription: "Model-derived wave dataset representing combined wind-sea and swell conditions",
          dataType: "Reanalysis",
          dataTypeDescription: "Spectral wave model validated using satellite altimetry and in-situ observations",
          resolution: "~0.25°, 3-hourly",
          processingApplied: "Significant wave parameters extracted, cleaned, and used for statistical and EVA analysis",
        },
        {
          category: "Swell",
          source: "ERA5 Wave Model",
          sourceDescription: "Partitioned wave component representing long-period waves from distant sources",
          dataType: "Reanalysis",
          dataTypeDescription: "Derived from spectral wave partitioning separating swell from wind-sea",
          resolution: "~0.25°, 3-hourly",
          processingApplied: "Swell parameters extracted and used for dedicated statistical and extreme value analysis",
        },
        {
          category: "Currents",
          source: "GLOBAL_MULTIYEAR_PHY_001_030 (CMEMS)",
          sourceDescription: "Global ocean physics reanalysis dataset produced by Mercator Ocean, combining numerical ocean models with satellite and in-situ observations",
          dataType: "Reanalysis",
          dataTypeDescription: "Numerical ocean reanalysis assimilating sea surface height, temperature, salinity, and in-situ observations to estimate ocean circulation",
          resolution: "~0.083, daily",
          processingApplied: "Eastward and northward current components extracted, combined to compute current speed and direction, data cleaned and used for statistical, exceedance, and extreme value analysis",
        },
        {
          category: "Water level",
          source: "Global Ocean Physics Reanalysis; Global Ocean Waves Reanalysis (CMEMS)",
          sourceDescription: "Physics reanalysis for sea level and wave reanalysis for wave parameters",
          dataType: "Reanalysis",
          dataTypeDescription: "Computed as sum of tide, surge, and wave run-up",
          resolution: "~0.2, 3-hourly",
          processingApplied: "Tide and surge combined; wave run-up computed from wave parameters; all components aligned and summed to obtain 3-hourly TWL",
        },
      ],
      statRows: [
        {
          method: "Descriptive Statistics",
          description: "Basic statistical measures (mean, P90, P95, max)",
          workingPrinciple: "Data grouped by time (monthly/seasonal) and statistical metrics computed",
          appliedTo: "Wind, Wave, Swell, storm surge, ocean currents",
          purpose: "Identify variability and operational trends",
        },
        {
          method: "Monthly Analysis",
          description: "Time-based aggregation",
          workingPrinciple: "Data grouped by month and summarized",
          appliedTo: "Wind, Wave, Swell, storm surge, ocean currents",
          purpose: "Understand seasonal patterns",
        },
        {
          method: "Seasonal Analysis",
          description: "Aggregation by defined seasons",
          workingPrinciple: "Data grouped into seasonal blocks (monsoon, winter, etc.)",
          appliedTo: "Wind, Wave, Swell, storm surge, ocean currents",
          purpose: "Identify seasonal variability",
        },
        {
          method: "GEV (Generalized Extreme Value)",
          description: "Extreme value model using block maxima",
          workingPrinciple: "Annual maximum values are extracted and fitted to a probability distribution",
          appliedTo: "Wind, Gust, Wave Hs, Tp, Swell",
          purpose: "Estimate return period values (10, 50, 100 years)",
        },
        {
          method: "GPD (Generalized Pareto Distribution)",
          description: "Peaks Over Threshold method",
          workingPrinciple: "Values above a high threshold (97th percentile) are modeled to estimate extremes",
          appliedTo: "Wind, Gust, Wave, Swell",
          purpose: "Improve estimation of extreme events using more data",
        },
        {
          method: "Return Period Estimation",
          description: "Probability-based extreme prediction",
          workingPrinciple: "Uses (P = 1 - {1/T}) to compute return levels",
          appliedTo: "All extreme parameters",
          purpose: "Predict rare events beyond observed data",
        },
        {
          method: "Bootstrap Confidence Interval",
          description: "Uncertainty estimation method",
          workingPrinciple: "Re-sampling data multiple times to compute variability in results",
          appliedTo: "GPD outputs",
          purpose: "Provide confidence bounds for extreme values",
        },
        {
          method: "Probability of Exceedance (PoE)",
          description: "Frequency analysis",
          workingPrinciple: "Ratio of exceedances above threshold to total observations",
          appliedTo: "Wind, Wave, Swell, storm surge, ocean currents",
          purpose: "Quantify operational risk",
        },
        {
          method: "Operability Analysis",
          description: "Safe vs unsafe condition evaluation",
          workingPrinciple: "Conditions checked against thresholds for each time step",
          appliedTo: "Wind, Wave (primary)",
          purpose: "Determine workable operational windows",
        },
        {
          method: "Threshold Selection (GPD)",
          description: "Extreme filtering technique",
          workingPrinciple: "High percentile (97%) used to isolate extreme values",
          appliedTo: "Wind, Wave, Swell, storm surge, ocean currents",
          purpose: "Ensure stable and realistic extreme modeling",
        },
      ],
    },
  ],
};

export function getReportBySlug(slug) {
  return dashboardData.reports.find((report) => report.slug === slug) ?? null;
}
