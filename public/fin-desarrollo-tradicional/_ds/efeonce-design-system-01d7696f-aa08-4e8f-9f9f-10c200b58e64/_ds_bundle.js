/* @ds-bundle: {"format":3,"namespace":"EfeonceDesignSystem_01d769","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"IconButton","sourcePath":"components/buttons/IconButton.jsx"},{"name":"Avatar","sourcePath":"components/data/Avatar.jsx"},{"name":"Badge","sourcePath":"components/data/Badge.jsx"},{"name":"Card","sourcePath":"components/data/Card.jsx"},{"name":"Tag","sourcePath":"components/data/Tag.jsx"},{"name":"Alert","sourcePath":"components/feedback/Alert.jsx"},{"name":"Progress","sourcePath":"components/feedback/Progress.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"Accordion","sourcePath":"components/navigation/Accordion.jsx"},{"name":"Pagination","sourcePath":"components/navigation/Pagination.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/buttons/Button.jsx":"afe215d03449","components/buttons/IconButton.jsx":"a0f03cb89d52","components/data/Avatar.jsx":"ba572ae3ce1f","components/data/Badge.jsx":"931ab26600b0","components/data/Card.jsx":"efc5907e6ed7","components/data/Tag.jsx":"5baec1cd9559","components/feedback/Alert.jsx":"600716487650","components/feedback/Progress.jsx":"255e4b44b338","components/feedback/Tooltip.jsx":"e475c3e674a7","components/forms/Checkbox.jsx":"61ba452182e8","components/forms/Input.jsx":"f5ff543d111a","components/forms/Radio.jsx":"ffc87e8bc9c3","components/forms/Select.jsx":"0ecdbaff6ada","components/forms/Switch.jsx":"5e1254eed849","components/forms/Textarea.jsx":"a7ddb2182ee8","components/navigation/Accordion.jsx":"21702cfad2fc","components/navigation/Pagination.jsx":"1fd773cfd06a","components/navigation/Tabs.jsx":"260643bd20f1","ui_kits/marketing/Features.jsx":"49eaf439bdae","ui_kits/marketing/Footer.jsx":"bc45b87736b2","ui_kits/marketing/Hero.jsx":"fc3fba01a5fe","ui_kits/marketing/Pricing.jsx":"6d5ce8dab89e","ui_kits/marketing/SiteHeader.jsx":"83d4b2037d5b","ui_kits/marketing/StudioBottom.jsx":"1e84ec8828b1","ui_kits/marketing/StudioMid.jsx":"4713ef1465a9","ui_kits/marketing/StudioTop.jsx":"c29f11124927","ui_kits/marketing/icons.jsx":"1967efbadb01"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.EfeonceDesignSystem_01d769 = window.EfeonceDesignSystem_01d769 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Efeonce Button — the primary action control.
 * Solid / outline / ghost / link variants in primary (blue) or neutral (ink),
 * three sizes, optional leading/trailing icons. 12px radius, 2px borders,
 * DM Sans 600 with tight tracking.
 */
function Button({
  children,
  variant = "solid",
  tone = "primary",
  size = "md",
  iconBefore = null,
  iconAfter = null,
  fullWidth = false,
  disabled = false,
  type = "button",
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      h: "var(--control-sm)",
      px: "16px",
      fs: "15px",
      gap: "6px",
      icon: 18
    },
    md: {
      h: "var(--control-md)",
      px: "20px",
      fs: "16px",
      gap: "8px",
      icon: 20
    },
    lg: {
      h: "var(--control-lg)",
      px: "24px",
      fs: "17px",
      gap: "10px",
      icon: 22
    }
  };
  const s = sizes[size] || sizes.md;
  const tones = {
    primary: {
      solidBg: "var(--color-primary)",
      solidBgHover: "var(--color-primary-hover)",
      onSolid: "var(--color-on-primary)",
      line: "var(--color-primary)",
      text: "var(--color-primary)",
      soft: "var(--color-primary-soft)"
    },
    neutral: {
      solidBg: "var(--blue-ink)",
      solidBgHover: "#06325c",
      onSolid: "#ffffff",
      line: "var(--blue-ink)",
      text: "var(--blue-ink)",
      soft: "var(--neutral-100)"
    }
  };
  const t = tones[tone] || tones.primary;
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: s.gap,
    height: s.h,
    padding: `0 ${s.px}`,
    width: fullWidth ? "100%" : "auto",
    fontFamily: "var(--font-title)",
    fontWeight: "var(--fw-semibold)",
    fontSize: s.fs,
    letterSpacing: "-0.02em",
    lineHeight: 1,
    borderRadius: "var(--radius-md)",
    border: "var(--border-width) solid transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    whiteSpace: "nowrap",
    transition: "var(--transition-control)",
    boxSizing: "border-box",
    appearance: "none",
    WebkitAppearance: "none"
  };
  const variants = {
    solid: {
      background: t.solidBg,
      color: t.onSolid,
      borderColor: t.solidBg
    },
    outline: {
      background: "transparent",
      color: t.text,
      borderColor: t.line
    },
    ghost: {
      background: "transparent",
      color: t.text,
      borderColor: "transparent"
    },
    link: {
      background: "transparent",
      color: t.text,
      borderColor: "transparent",
      height: "auto",
      padding: "0",
      borderRadius: 0
    }
  };
  const hoverBg = {
    solid: t.solidBgHover,
    outline: t.soft,
    ghost: t.soft,
    link: "transparent"
  }[variant];
  const handleEnter = e => {
    if (disabled) return;
    if (variant === "solid") e.currentTarget.style.background = hoverBg;else if (variant === "link") e.currentTarget.style.textDecoration = "underline";else e.currentTarget.style.background = hoverBg;
    if (variant === "solid") e.currentTarget.style.borderColor = hoverBg;
  };
  const handleLeave = e => {
    const v = variants[variant];
    e.currentTarget.style.background = v.background;
    e.currentTarget.style.borderColor = v.borderColor;
    e.currentTarget.style.textDecoration = "none";
  };
  const ic = node => node ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: s.icon,
      height: s.icon,
      flexShrink: 0
    }
  }, node) : null;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onMouseEnter: handleEnter,
    onMouseLeave: handleLeave,
    style: {
      ...base,
      ...variants[variant],
      ...style
    }
  }, rest), ic(iconBefore), children, ic(iconAfter));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/buttons/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Efeonce IconButton — a square/circular control for a single icon.
 * Mirrors Button's variants & tones; `shape` toggles rounded-square vs circle.
 */
function IconButton({
  children,
  variant = "ghost",
  tone = "primary",
  size = "md",
  shape = "square",
  disabled = false,
  ariaLabel,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      box: "36px",
      icon: 18
    },
    md: {
      box: "44px",
      icon: 20
    },
    lg: {
      box: "52px",
      icon: 24
    }
  };
  const s = sizes[size] || sizes.md;
  const tones = {
    primary: {
      bg: "var(--color-primary)",
      on: "#fff",
      line: "var(--color-primary)",
      text: "var(--color-primary)",
      soft: "var(--color-primary-soft)",
      hover: "var(--color-primary-hover)"
    },
    neutral: {
      bg: "var(--blue-ink)",
      on: "#fff",
      line: "var(--border-default)",
      text: "var(--blue-ink)",
      soft: "var(--neutral-100)",
      hover: "#06325c"
    }
  };
  const t = tones[tone] || tones.primary;
  const variants = {
    solid: {
      background: t.bg,
      color: t.on,
      borderColor: t.bg
    },
    outline: {
      background: "transparent",
      color: t.text,
      borderColor: t.line
    },
    ghost: {
      background: "transparent",
      color: t.text,
      borderColor: "transparent"
    }
  };
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: s.box,
    height: s.box,
    border: "var(--border-width) solid transparent",
    borderRadius: shape === "circle" ? "var(--radius-circle)" : "var(--radius-md)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "var(--transition-control)",
    boxSizing: "border-box",
    appearance: "none",
    padding: 0
  };
  const handleEnter = e => {
    if (disabled) return;
    e.currentTarget.style.background = variant === "solid" ? t.hover : t.soft;
    if (variant === "solid") e.currentTarget.style.borderColor = t.hover;
  };
  const handleLeave = e => {
    e.currentTarget.style.background = variants[variant].background;
    e.currentTarget.style.borderColor = variants[variant].borderColor;
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": ariaLabel,
    disabled: disabled,
    onMouseEnter: handleEnter,
    onMouseLeave: handleLeave,
    style: {
      ...base,
      ...variants[variant],
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: s.icon,
      height: s.icon
    }
  }, children));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/data/Avatar.jsx
try { (() => {
/** Avatar — image, or initials on a brand-tinted background. */
function Avatar({
  src,
  name = "",
  size = "md",
  style = {}
}) {
  const sizes = {
    sm: 32,
    md: 44,
    lg: 56,
    xl: 72
  };
  const px = sizes[size] || sizes.md;
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: px,
      height: px,
      borderRadius: "var(--radius-circle)",
      overflow: "hidden",
      background: "var(--color-primary-soft)",
      color: "var(--color-primary)",
      fontFamily: "var(--font-title)",
      fontWeight: "var(--fw-semibold)",
      fontSize: px * 0.38,
      flexShrink: 0,
      ...style
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initials);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/data/Badge.jsx
try { (() => {
/**
 * Badge — compact status/label pill. Solid or soft fill across the brand
 * accent hues + semantic colors.
 */
function Badge({
  children,
  color = "primary",
  variant = "soft",
  size = "md",
  style = {}
}) {
  const map = {
    primary: {
      solid: "var(--color-primary)",
      soft: "var(--color-primary-soft)",
      text: "var(--color-primary)"
    },
    neutral: {
      solid: "var(--blue-ink)",
      soft: "var(--neutral-100)",
      text: "var(--neutral-700)"
    },
    success: {
      solid: "var(--color-success)",
      soft: "var(--color-success-bg)",
      text: "var(--green-700)"
    },
    warning: {
      solid: "var(--color-warning)",
      soft: "var(--color-warning-bg)",
      text: "var(--color-warning)"
    },
    danger: {
      solid: "var(--color-danger)",
      soft: "var(--color-danger-bg)",
      text: "var(--color-danger)"
    },
    purple: {
      solid: "var(--purple)",
      soft: "var(--purple-100)",
      text: "var(--purple)"
    },
    orange: {
      solid: "var(--orange)",
      soft: "var(--orange-100)",
      text: "var(--orange)"
    }
  };
  const c = map[color] || map.primary;
  const sizes = {
    sm: {
      fs: "11px",
      pad: "2px 8px"
    },
    md: {
      fs: "12px",
      pad: "4px 10px"
    },
    lg: {
      fs: "13px",
      pad: "5px 12px"
    }
  };
  const s = sizes[size] || sizes.md;
  const solid = variant === "solid";
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: s.pad,
      fontFamily: "var(--font-body)",
      fontWeight: "var(--fw-semibold)",
      fontSize: s.fs,
      lineHeight: 1.4,
      letterSpacing: "0.01em",
      borderRadius: "var(--radius-pill)",
      background: solid ? c.solid : c.soft,
      color: solid ? "#fff" : c.text,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Badge.jsx", error: String((e && e.message) || e) }); }

// components/data/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Card — the surface primitive. Soft cool shadow, 16px radius, optional
 * hover lift. Compose freely; `padding` controls inner spacing.
 */
function Card({
  children,
  elevation = "sm",
  hoverable = false,
  padding = "24px",
  style = {},
  ...rest
}) {
  const shadows = {
    none: "none",
    sm: "var(--shadow-sm)",
    md: "var(--shadow-md)",
    lg: "var(--shadow-lg)"
  };
  const base = {
    background: "var(--surface-card)",
    border: "var(--border-width-hair) solid var(--border-subtle)",
    borderRadius: "var(--radius-lg)",
    boxShadow: shadows[elevation] || shadows.sm,
    padding,
    transition: "var(--transition-control)",
    boxSizing: "border-box"
  };
  const onEnter = e => {
    if (hoverable) {
      e.currentTarget.style.transform = "translateY(-3px)";
      e.currentTarget.style.boxShadow = "var(--shadow-lg)";
    }
  };
  const onLeave = e => {
    if (hoverable) {
      e.currentTarget.style.transform = "none";
      e.currentTarget.style.boxShadow = shadows[elevation] || shadows.sm;
    }
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: onEnter,
    onMouseLeave: onLeave,
    style: {
      ...base,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Card.jsx", error: String((e && e.message) || e) }); }

// components/data/Tag.jsx
try { (() => {
/** Tag — an outlined chip for categories/filters, optionally removable. */
function Tag({
  children,
  onRemove,
  active = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "5px 12px",
      fontFamily: "var(--font-body)",
      fontWeight: "var(--fw-medium)",
      fontSize: "14px",
      lineHeight: 1.4,
      borderRadius: "var(--radius-pill)",
      border: "var(--border-width-hair) solid " + (active ? "var(--color-primary)" : "var(--border-default)"),
      background: active ? "var(--color-primary-soft)" : "transparent",
      color: active ? "var(--color-primary)" : "var(--text-body)",
      transition: "var(--transition-control)",
      cursor: "default",
      ...style
    }
  }, children, onRemove && /*#__PURE__*/React.createElement("button", {
    onClick: onRemove,
    "aria-label": "Remove",
    style: {
      display: "inline-flex",
      border: "none",
      background: "transparent",
      padding: 0,
      cursor: "pointer",
      color: "inherit",
      opacity: 0.6
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "18",
    y1: "6",
    x2: "6",
    y2: "18"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "6",
    y1: "6",
    x2: "18",
    y2: "18"
  }))));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Alert.jsx
try { (() => {
const ICONS = {
  info: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "16",
    x2: "12",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "8",
    x2: "12.01",
    y2: "8"
  })),
  success: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M22 11.08V12a10 10 0 1 1-5.93-9.14"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "22 4 12 14.01 9 11.01"
  })),
  warning: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "9",
    x2: "12",
    y2: "13"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "17",
    x2: "12.01",
    y2: "17"
  })),
  danger: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "15",
    y1: "9",
    x2: "9",
    y2: "15"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "9",
    y1: "9",
    x2: "15",
    y2: "15"
  }))
};

/** Alert — inline message banner across the four semantic tones. */
function Alert({
  children,
  title,
  tone = "info",
  onClose,
  style = {}
}) {
  const map = {
    info: {
      fg: "var(--color-info)",
      bg: "var(--color-info-bg)"
    },
    success: {
      fg: "var(--green-700)",
      bg: "var(--color-success-bg)"
    },
    warning: {
      fg: "var(--color-warning)",
      bg: "var(--color-warning-bg)"
    },
    danger: {
      fg: "var(--color-danger)",
      bg: "var(--color-danger-bg)"
    }
  };
  const c = map[tone] || map.info;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "12px",
      padding: "14px 16px",
      background: c.bg,
      borderRadius: "var(--radius-md)",
      border: "var(--border-width-hair) solid " + c.fg + "33",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: 20,
      height: 20,
      flexShrink: 0,
      color: c.fg,
      marginTop: 1
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, ICONS[tone])), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: "var(--fw-semibold)",
      fontSize: "15px",
      color: "var(--text-strong)",
      marginBottom: children ? 2 : 0
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "14px",
      color: "var(--text-body)",
      lineHeight: "var(--lh-normal)"
    }
  }, children)), onClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Dismiss",
    style: {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color: "var(--text-muted)",
      padding: 0,
      display: "inline-flex",
      height: 20
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "18",
    y1: "6",
    x2: "6",
    y2: "18"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "6",
    y1: "6",
    x2: "18",
    y2: "18"
  }))));
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Alert.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Progress.jsx
try { (() => {
/** Progress bar — linear track with brand-blue fill. */
function Progress({
  value = 0,
  max = 100,
  tone = "primary",
  showLabel = false,
  size = "md",
  style = {}
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const heights = {
    sm: 6,
    md: 10,
    lg: 14
  };
  const h = heights[size] || heights.md;
  const fill = {
    primary: "var(--color-primary)",
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    danger: "var(--color-danger)"
  }[tone] || "var(--color-primary)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      width: "100%",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: h,
      background: "var(--surface-sunken)",
      borderRadius: "var(--radius-pill)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: pct + "%",
      height: "100%",
      background: fill,
      borderRadius: "var(--radius-pill)",
      transition: "width var(--dur-normal) var(--ease-out)"
    }
  })), showLabel && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: "var(--fw-semibold)",
      fontSize: "13px",
      color: "var(--text-muted)",
      minWidth: 36,
      textAlign: "right"
    }
  }, Math.round(pct), "%"));
}
Object.assign(__ds_scope, { Progress });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Progress.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
/** Tooltip — hover/focus label on a dark ink bubble. CSS-only positioning. */
function Tooltip({
  children,
  label,
  position = "top",
  style = {}
}) {
  const [open, setOpen] = React.useState(false);
  const pos = {
    top: {
      bottom: "calc(100% + 8px)",
      left: "50%",
      transform: "translateX(-50%)"
    },
    bottom: {
      top: "calc(100% + 8px)",
      left: "50%",
      transform: "translateX(-50%)"
    },
    left: {
      right: "calc(100% + 8px)",
      top: "50%",
      transform: "translateY(-50%)"
    },
    right: {
      left: "calc(100% + 8px)",
      top: "50%",
      transform: "translateY(-50%)"
    }
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-flex",
      ...style
    },
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false)
  }, children, open && /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: "absolute",
      zIndex: 50,
      whiteSpace: "nowrap",
      padding: "6px 10px",
      background: "var(--blue-ink)",
      color: "#fff",
      fontFamily: "var(--font-body)",
      fontSize: "13px",
      fontWeight: "var(--fw-medium)",
      borderRadius: "var(--radius-sm)",
      boxShadow: "var(--shadow-md)",
      pointerEvents: "none",
      ...pos[position]
    }
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
/** Checkbox with a brand-blue checked state and 2px border. */
function Checkbox({
  label,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  id,
  style = {}
}) {
  const fieldId = id || (label ? "ef-cb-" + String(label).toLowerCase().replace(/\s+/g, "-") : undefined);
  const [internal, setInternal] = React.useState(defaultChecked || false);
  const isControlled = checked !== undefined;
  const on = isControlled ? checked : internal;
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.55 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      flexShrink: 0,
      borderRadius: "var(--radius-xs)",
      border: `var(--border-width) solid ${on ? "var(--color-primary)" : "var(--field-border)"}`,
      background: on ? "var(--color-primary)" : "var(--field-bg)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "var(--transition-control)"
    }
  }, on && /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "3.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  }))), /*#__PURE__*/React.createElement("input", {
    id: fieldId,
    type: "checkbox",
    checked: on,
    disabled: disabled,
    onChange: e => {
      if (!isControlled) setInternal(e.target.checked);
      onChange && onChange(e);
    },
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "15px",
      color: "var(--text-body)"
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Efeonce text Input — 2px border, 12px radius, blue focus ring. */
function Input({
  label,
  hint,
  error,
  size = "md",
  iconBefore = null,
  disabled = false,
  id,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      h: "var(--control-sm)",
      fs: "14px"
    },
    md: {
      h: "var(--control-md)",
      fs: "16px"
    },
    lg: {
      h: "var(--control-lg)",
      fs: "17px"
    }
  };
  const s = sizes[size] || sizes.md;
  const fieldId = id || (label ? "ef-" + label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const wrap = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    height: s.h,
    padding: "0 14px",
    background: "var(--field-bg)",
    border: `var(--border-width) solid ${error ? "var(--color-danger)" : "var(--field-border)"}`,
    borderRadius: "var(--radius-md)",
    transition: "var(--transition-control)",
    boxSizing: "border-box",
    opacity: disabled ? 0.55 : 1
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      width: "100%",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: "var(--fw-medium)",
      fontSize: "14px",
      color: "var(--text-strong)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: wrap,
    onFocusCapture: e => {
      if (!disabled) {
        e.currentTarget.style.borderColor = error ? "var(--color-danger)" : "var(--border-focus)";
        e.currentTarget.style.boxShadow = error ? "var(--focus-ring-danger)" : "var(--focus-ring)";
      }
    },
    onBlurCapture: e => {
      e.currentTarget.style.borderColor = error ? "var(--color-danger)" : "var(--field-border)";
      e.currentTarget.style.boxShadow = "none";
    }
  }, iconBefore && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: 18,
      height: 18,
      color: "var(--text-subtle)",
      flexShrink: 0
    }
  }, iconBefore), /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    disabled: disabled,
    style: {
      flex: 1,
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      fontFamily: "var(--font-body)",
      fontSize: s.fs,
      color: "var(--field-text)",
      padding: 0
    }
  }, rest))), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "13px",
      color: error ? "var(--color-danger)" : "var(--text-muted)"
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
/** Radio button with brand-blue dot. Use within a shared `name` group. */
function Radio({
  label,
  name,
  value,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  id,
  style = {}
}) {
  const fieldId = id || (value ? "ef-rd-" + String(value).toLowerCase().replace(/\s+/g, "-") : undefined);
  const [internal, setInternal] = React.useState(defaultChecked || false);
  const isControlled = checked !== undefined;
  const on = isControlled ? checked : internal;
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.55 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      flexShrink: 0,
      borderRadius: "var(--radius-circle)",
      border: `var(--border-width) solid ${on ? "var(--color-primary)" : "var(--field-border)"}`,
      background: "var(--field-bg)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "var(--transition-control)"
    }
  }, on && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: "var(--color-primary)"
    }
  })), /*#__PURE__*/React.createElement("input", {
    id: fieldId,
    type: "radio",
    name: name,
    value: value,
    checked: on,
    disabled: disabled,
    onChange: e => {
      if (!isControlled) setInternal(e.target.checked);
      onChange && onChange(e);
    },
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "15px",
      color: "var(--text-body)"
    }
  }, label));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Native select styled to match Efeonce fields, with chevron affordance. */
function Select({
  label,
  hint,
  options = [],
  size = "md",
  disabled = false,
  id,
  style = {},
  children,
  ...rest
}) {
  const sizes = {
    sm: "var(--control-sm)",
    md: "var(--control-md)",
    lg: "var(--control-lg)"
  };
  const h = sizes[size] || sizes.md;
  const fieldId = id || (label ? "ef-sel-" + label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const chevron = "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2334404e' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>`);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      width: "100%",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: "var(--fw-medium)",
      fontSize: "14px",
      color: "var(--text-strong)"
    }
  }, label), /*#__PURE__*/React.createElement("select", _extends({
    id: fieldId,
    disabled: disabled,
    onFocus: e => {
      e.currentTarget.style.borderColor = "var(--border-focus)";
      e.currentTarget.style.boxShadow = "var(--focus-ring)";
    },
    onBlur: e => {
      e.currentTarget.style.borderColor = "var(--field-border)";
      e.currentTarget.style.boxShadow = "none";
    },
    style: {
      height: h,
      width: "100%",
      padding: "0 40px 0 14px",
      background: `var(--field-bg) url("${chevron}") no-repeat right 12px center`,
      border: "var(--border-width) solid var(--field-border)",
      borderRadius: "var(--radius-md)",
      fontFamily: "var(--font-body)",
      fontSize: "16px",
      color: "var(--field-text)",
      appearance: "none",
      WebkitAppearance: "none",
      outline: "none",
      cursor: "pointer",
      transition: "var(--transition-control)",
      boxSizing: "border-box",
      opacity: disabled ? 0.55 : 1
    }
  }, rest), children || options.map(o => {
    const val = typeof o === "string" ? o : o.value;
    const lbl = typeof o === "string" ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: val,
      value: val
    }, lbl);
  })), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "13px",
      color: "var(--text-muted)"
    }
  }, hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
/** Toggle switch — blue track when on, sliding white knob. */
function Switch({
  label,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  id,
  style = {}
}) {
  const [internal, setInternal] = React.useState(defaultChecked || false);
  const isControlled = checked !== undefined;
  const on = isControlled ? checked : internal;
  const fieldId = id || (label ? "ef-sw-" + String(label).toLowerCase().replace(/\s+/g, "-") : undefined);
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.55 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: e => {
      if (disabled) return;
      const next = !on;
      if (!isControlled) setInternal(next);
      onChange && onChange({
        target: {
          checked: next
        }
      });
    },
    style: {
      width: 44,
      height: 26,
      flexShrink: 0,
      borderRadius: "var(--radius-pill)",
      background: on ? "var(--color-primary)" : "var(--neutral-300)",
      padding: 3,
      boxSizing: "border-box",
      transition: "var(--transition-control)",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      width: 20,
      height: 20,
      borderRadius: "50%",
      background: "#fff",
      boxShadow: "var(--shadow-sm)",
      transform: on ? "translateX(18px)" : "translateX(0)",
      transition: "transform var(--dur-fast) var(--ease-standard)"
    }
  })), /*#__PURE__*/React.createElement("input", {
    id: fieldId,
    type: "checkbox",
    checked: on,
    disabled: disabled,
    readOnly: true,
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "15px",
      color: "var(--text-body)"
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Multi-line text field. Shares Input's framing. */
function Textarea({
  label,
  hint,
  error,
  rows = 4,
  disabled = false,
  id,
  style = {},
  ...rest
}) {
  const fieldId = id || (label ? "ef-ta-" + label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      width: "100%",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: "var(--fw-medium)",
      fontSize: "14px",
      color: "var(--text-strong)"
    }
  }, label), /*#__PURE__*/React.createElement("textarea", _extends({
    id: fieldId,
    rows: rows,
    disabled: disabled,
    onFocus: e => {
      e.currentTarget.style.borderColor = error ? "var(--color-danger)" : "var(--border-focus)";
      e.currentTarget.style.boxShadow = error ? "var(--focus-ring-danger)" : "var(--focus-ring)";
    },
    onBlur: e => {
      e.currentTarget.style.borderColor = error ? "var(--color-danger)" : "var(--field-border)";
      e.currentTarget.style.boxShadow = "none";
    },
    style: {
      width: "100%",
      padding: "12px 14px",
      resize: "vertical",
      background: "var(--field-bg)",
      border: `var(--border-width) solid ${error ? "var(--color-danger)" : "var(--field-border)"}`,
      borderRadius: "var(--radius-md)",
      fontFamily: "var(--font-body)",
      fontSize: "16px",
      color: "var(--field-text)",
      lineHeight: "var(--lh-normal)",
      outline: "none",
      transition: "var(--transition-control)",
      boxSizing: "border-box",
      opacity: disabled ? 0.55 : 1
    }
  }, rest)), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "13px",
      color: error ? "var(--color-danger)" : "var(--text-muted)"
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Accordion.jsx
try { (() => {
/** Accordion — a list of expandable items. Single-open by default. */
function Accordion({
  items = [],
  allowMultiple = false,
  style = {}
}) {
  const [open, setOpen] = React.useState(() => new Set());
  const toggle = i => {
    setOpen(prev => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(i)) next.delete(i);else next.add(i);
      return next;
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      ...style
    }
  }, items.map((it, i) => {
    const on = open.has(i);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        border: "var(--border-width-hair) solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface-card)",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => toggle(i),
      "aria-expanded": on,
      style: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "16px 18px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontFamily: "var(--font-title)",
        fontWeight: "var(--fw-semibold)",
        fontSize: "16px",
        letterSpacing: "-0.01em",
        color: "var(--text-strong)",
        textAlign: "left"
      }
    }, /*#__PURE__*/React.createElement("span", null, it.title), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        width: 20,
        height: 20,
        color: "var(--color-primary)",
        transition: "transform var(--dur-fast) var(--ease-standard)",
        transform: on ? "rotate(45deg)" : "none",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.4",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "5",
      x2: "12",
      y2: "19"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "5",
      y1: "12",
      x2: "19",
      y2: "12"
    })))), on && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 18px 18px",
        fontFamily: "var(--font-body)",
        fontSize: "15px",
        lineHeight: "var(--lh-relaxed)",
        color: "var(--text-body)"
      }
    }, it.content));
  }));
}
Object.assign(__ds_scope, { Accordion });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Accordion.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Pagination.jsx
try { (() => {
/** Pagination — page number controls with brand-blue current page. */
function Pagination({
  total = 1,
  page = 1,
  onChange,
  style = {}
}) {
  const go = p => {
    if (p >= 1 && p <= total && onChange) onChange(p);
  };
  const pages = [];
  const add = p => pages.push(p);
  if (total <= 7) {
    for (let i = 1; i <= total; i++) add(i);
  } else {
    add(1);
    if (page > 3) add("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) add(i);
    if (page < total - 2) add("…");
    add(total);
  }
  const cell = (content, opts = {}) => {
    const {
      active,
      disabled,
      key,
      onClick
    } = opts;
    return /*#__PURE__*/React.createElement("button", {
      key: key,
      onClick: onClick,
      disabled: disabled || content === "…",
      style: {
        minWidth: 40,
        height: 40,
        padding: "0 10px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "var(--border-width-hair) solid " + (active ? "var(--color-primary)" : "var(--border-subtle)"),
        background: active ? "var(--color-primary)" : "transparent",
        color: active ? "#fff" : disabled ? "var(--text-subtle)" : "var(--text-body)",
        borderRadius: "var(--radius-sm)",
        cursor: disabled || content === "…" ? "default" : "pointer",
        fontFamily: "var(--font-body)",
        fontWeight: "var(--fw-semibold)",
        fontSize: "14px",
        transition: "var(--transition-control)"
      }
    }, content);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      gap: "6px",
      alignItems: "center",
      ...style
    }
  }, cell("‹", {
    key: "prev",
    disabled: page <= 1,
    onClick: () => go(page - 1)
  }), pages.map((p, i) => p === "…" ? cell("…", {
    key: "e" + i
  }) : cell(p, {
    key: p,
    active: p === page,
    onClick: () => go(p)
  })), cell("›", {
    key: "next",
    disabled: page >= total,
    onClick: () => go(page + 1)
  }));
}
Object.assign(__ds_scope, { Pagination });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Pagination.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
/** Tabs — underline-style segmented navigation with brand-blue active state. */
function Tabs({
  tabs = [],
  value,
  defaultValue,
  onChange,
  style = {}
}) {
  const first = defaultValue ?? (tabs[0] && (tabs[0].value ?? tabs[0]));
  const [internal, setInternal] = React.useState(first);
  const active = value !== undefined ? value : internal;
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: "flex",
      gap: "4px",
      borderBottom: "var(--border-width-hair) solid var(--border-subtle)",
      ...style
    }
  }, tabs.map(t => {
    const val = t.value ?? t;
    const label = t.label ?? t;
    const on = val === active;
    return /*#__PURE__*/React.createElement("button", {
      key: val,
      role: "tab",
      "aria-selected": on,
      onClick: () => {
        if (value === undefined) setInternal(val);
        onChange && onChange(val);
      },
      style: {
        position: "relative",
        border: "none",
        background: "transparent",
        padding: "12px 16px",
        cursor: "pointer",
        fontFamily: "var(--font-title)",
        fontWeight: "var(--fw-semibold)",
        fontSize: "15px",
        letterSpacing: "-0.01em",
        color: on ? "var(--color-primary)" : "var(--text-muted)",
        transition: "var(--transition-control)"
      }
    }, label, /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        left: 12,
        right: 12,
        bottom: -1,
        height: 2.5,
        borderRadius: "2px 2px 0 0",
        background: on ? "var(--color-primary)" : "transparent",
        transition: "var(--transition-control)"
      }
    }));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Features.jsx
try { (() => {
/* Efeonce marketing — logos strip + feature grid */
function LogoStrip() {
  const names = ["Northwind", "Lumen", "Crestpay", "Vela", "Orbit", "Hexa"];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      borderTop: "1px solid var(--border-subtle)",
      borderBottom: "1px solid var(--border-subtle)",
      background: "var(--surface-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: "0 auto",
      padding: "28px 32px",
      display: "flex",
      alignItems: "center",
      gap: 40,
      justifyContent: "center",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 13,
      color: "var(--text-subtle)",
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase"
    }
  }, "Powering growth at"), names.map(n => /*#__PURE__*/React.createElement("span", {
    key: n,
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 700,
      fontSize: 21,
      letterSpacing: "-0.02em",
      color: "var(--neutral-400)"
    }
  }, n))));
}
window.LogoStrip = LogoStrip;
function FeatureGrid() {
  const {
    Card
  } = window.EfeonceDesignSystem_01d769;
  const I = window.EfIcons;
  const features = [{
    icon: I.Chart,
    c: "var(--blue)",
    t: "Unified analytics",
    d: "Every funnel metric from first touch to expansion revenue, in one live workspace."
  }, {
    icon: I.Zap,
    c: "var(--orange)",
    t: "Experiment engine",
    d: "Launch A/B tests and growth loops without engineering bottlenecks."
  }, {
    icon: I.Users,
    c: "var(--purple)",
    t: "Audience segments",
    d: "Build behavioural cohorts and sync them to every channel automatically."
  }, {
    icon: I.Shield,
    c: "var(--green-700)",
    t: "Privacy-first",
    d: "SOC 2 Type II, GDPR-ready, with first-party data you actually own."
  }, {
    icon: I.Layers,
    c: "var(--magenta)",
    t: "60+ integrations",
    d: "Connect your stack in minutes — warehouses, CRMs, ad platforms and more."
  }, {
    icon: I.Globe,
    c: "var(--blue-deep)",
    t: "Global scale",
    d: "Sub-second queries across billions of events, in every region you operate."
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: 1180,
      margin: "0 auto",
      padding: "88px 32px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      maxWidth: 660,
      margin: "0 auto 52px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ef-eyebrow",
    style: {
      marginBottom: 12
    }
  }, "One platform"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 700,
      fontSize: 44,
      letterSpacing: "-0.025em",
      color: "var(--text-strong)",
      margin: "0 0 14px"
    }
  }, "Everything your growth team needs"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 18,
      color: "var(--text-muted)",
      margin: 0
    }
  }, "Replace a dozen disconnected tools with one source of truth for growth.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 22
    }
  }, features.map(f => {
    const Icon = f.icon;
    return /*#__PURE__*/React.createElement(Card, {
      key: f.t,
      hoverable: true,
      padding: "26px"
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        background: "color-mix(in srgb, " + f.c + " 12%, white)",
        color: f.c,
        marginBottom: 18
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      size: 24
    })), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontFamily: "var(--font-title)",
        fontWeight: 600,
        fontSize: 20,
        letterSpacing: "-0.01em",
        color: "var(--text-strong)",
        margin: "0 0 8px"
      }
    }, f.t), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: "var(--font-body)",
        fontSize: 15,
        lineHeight: 1.55,
        color: "var(--text-muted)",
        margin: 0
      }
    }, f.d));
  })));
}
window.FeatureGrid = FeatureGrid;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Features.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Footer.jsx
try { (() => {
/* Efeonce marketing — CTA band + footer */
function CTASection() {
  const {
    Button
  } = window.EfeonceDesignSystem_01d769;
  const {
    Arrow
  } = window.EfIcons;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: 1180,
      margin: "0 auto",
      padding: "20px 32px 88px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      overflow: "hidden",
      borderRadius: "var(--radius-3xl)",
      background: "var(--blue-ink)",
      padding: "64px 56px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "radial-gradient(620px 320px at 50% -30%, rgba(4,117,219,0.45), transparent 70%)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 700,
      fontSize: 42,
      letterSpacing: "-0.025em",
      color: "#fff",
      margin: "0 0 14px"
    }
  }, "Ready to empower your growth?"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 18,
      color: "rgba(255,255,255,0.78)",
      margin: "0 auto 28px",
      maxWidth: 520
    }
  }, "Join thousands of teams turning data into momentum. Free for 14 days."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "solid",
    size: "lg",
    iconAfter: /*#__PURE__*/React.createElement(Arrow, {
      size: 20
    })
  }, "Start free trial"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "lg",
    tone: "primary",
    style: {
      background: "rgba(255,255,255,0.04)",
      color: "#fff",
      borderColor: "rgba(255,255,255,0.4)"
    }
  }, "Talk to sales")))));
}
window.CTASection = CTASection;
function SiteFooter() {
  const cols = [["Product", ["Overview", "Analytics", "Experiments", "Integrations", "Pricing"]], ["Company", ["About", "Careers", "Customers", "Blog"]], ["Resources", ["Docs", "API", "Guides", "Status"]], ["Legal", ["Privacy", "Terms", "Security", "DPA"]]];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: "var(--blue-ink)",
      color: "rgba(255,255,255,0.7)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1180,
      margin: "0 auto",
      padding: "56px 32px 32px",
      display: "grid",
      gridTemplateColumns: "1.4fr repeat(4, 1fr)",
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-white.png",
    alt: "Efeonce",
    style: {
      height: 28,
      marginBottom: 16
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 14,
      lineHeight: 1.6,
      color: "rgba(255,255,255,0.55)",
      maxWidth: 240,
      margin: 0
    }
  }, "Empower your growth \u2014 the unified workspace for modern growth teams.")), cols.map(([h, items]) => /*#__PURE__*/React.createElement("div", {
    key: h
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 600,
      fontSize: 14,
      color: "#fff",
      marginBottom: 14
    }
  }, h), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, items.map(it => /*#__PURE__*/React.createElement("a", {
    key: it,
    href: "#",
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 14,
      color: "rgba(255,255,255,0.6)",
      textDecoration: "none"
    }
  }, it)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid rgba(255,255,255,0.12)",
      padding: "20px 32px",
      maxWidth: 1180,
      margin: "0 auto",
      display: "flex",
      justifyContent: "space-between",
      fontFamily: "var(--font-body)",
      fontSize: 13,
      color: "rgba(255,255,255,0.5)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Efeonce. All rights reserved."), /*#__PURE__*/React.createElement("span", null, "Empower your Growth")));
}
window.SiteFooter = SiteFooter;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Hero.jsx
try { (() => {
/* Efeonce marketing — hero */
function Hero({
  onNav
}) {
  const {
    Button,
    Badge
  } = window.EfeonceDesignSystem_01d769;
  const {
    Arrow,
    Sparkle
  } = window.EfIcons;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: "relative",
      overflow: "hidden",
      background: "var(--surface-page)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "radial-gradient(900px 460px at 78% -8%, rgba(4,117,219,0.10), transparent 60%)",
      pointerEvents: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      maxWidth: 1180,
      margin: "0 auto",
      padding: "92px 32px 80px",
      display: "grid",
      gridTemplateColumns: "1.05fr 0.95fr",
      gap: 56,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    color: "primary",
    variant: "soft",
    size: "lg"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement(Sparkle, {
    size: 13
  })), "New \xB7 Growth analytics 2.0")), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 700,
      fontSize: 60,
      lineHeight: 1.04,
      letterSpacing: "-0.03em",
      color: "var(--text-strong)",
      margin: 0
    }
  }, "Empower your", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-primary)"
    }
  }, "growth"), ", end to end."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 19,
      lineHeight: 1.55,
      color: "var(--text-muted)",
      margin: "22px 0 32px",
      maxWidth: 520
    }
  }, "Efeonce unifies your acquisition, activation and retention data into one workspace \u2014 so every team ships growth experiments with confidence."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "solid",
    size: "lg",
    iconAfter: /*#__PURE__*/React.createElement(Arrow, {
      size: 20
    }),
    onClick: () => onNav("pricing")
  }, "Start free trial"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    size: "lg"
  }, "Book a demo")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginTop: 28,
      color: "var(--text-subtle)",
      fontSize: 14,
      fontFamily: "var(--font-body)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      gap: -8
    }
  }, ["#0475db", "#623f93", "#6ec208", "#ff6501"].map((c, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 28,
      height: 28,
      borderRadius: "50%",
      background: c,
      border: "2px solid #fff",
      marginLeft: i ? -8 : 0
    }
  }))), "Trusted by 4,000+ growth teams")), /*#__PURE__*/React.createElement(HeroPanel, null)));
}
function HeroPanel() {
  const {
    Card
  } = window.EfeonceDesignSystem_01d769;
  const {
    Chart
  } = window.EfIcons;
  const bars = [38, 52, 46, 64, 58, 78, 70, 92];
  return /*#__PURE__*/React.createElement(Card, {
    elevation: "lg",
    padding: "24px",
    style: {
      borderRadius: "var(--radius-2xl)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 13,
      color: "var(--text-muted)"
    }
  }, "Monthly active growth"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 700,
      fontSize: 30,
      color: "var(--text-strong)",
      letterSpacing: "-0.02em"
    }
  }, "+38.2%")), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: 40,
      height: 40,
      borderRadius: 12,
      background: "var(--color-primary-soft)",
      color: "var(--color-primary)",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Chart, {
    size: 20
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 10,
      height: 150
    }
  }, bars.map((h, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      height: h + "%",
      borderRadius: "6px 6px 3px 3px",
      background: i === bars.length - 1 ? "var(--color-primary)" : "var(--blue-100)"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: 18,
      gap: 12
    }
  }, [["Activation", "72%", "var(--green)"], ["Retention", "64%", "var(--purple)"], ["Expansion", "28%", "var(--orange)"]].map(([k, v, c]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      flex: 1,
      padding: "12px 14px",
      borderRadius: 12,
      background: "var(--surface-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-muted)",
      fontFamily: "var(--font-body)"
    }
  }, k), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 700,
      fontSize: 20,
      color: c
    }
  }, v)))));
}
window.Hero = Hero;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Pricing.jsx
try { (() => {
/* Efeonce marketing — pricing section */
function PricingSection({
  compact
}) {
  const {
    Card,
    Button,
    Badge
  } = window.EfeonceDesignSystem_01d769;
  const {
    Check
  } = window.EfIcons;
  const plans = [{
    name: "Starter",
    price: "0",
    blurb: "For solo founders validating growth.",
    cta: "Start free",
    featured: false,
    feats: ["Up to 10k events / mo", "3 dashboards", "Community support", "1 seat"]
  }, {
    name: "Growth",
    price: "49",
    blurb: "For teams scaling acquisition.",
    cta: "Start free trial",
    featured: true,
    feats: ["Up to 1M events / mo", "Unlimited dashboards", "Experiment engine", "Unlimited seats", "Priority support"]
  }, {
    name: "Scale",
    price: "Custom",
    blurb: "For orgs with advanced needs.",
    cta: "Contact sales",
    featured: false,
    feats: ["Unlimited events", "SSO & SCIM", "Dedicated CSM", "Custom SLAs", "On-prem option"]
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: compact ? "transparent" : "var(--surface-subtle)",
      borderTop: compact ? "none" : "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1100,
      margin: "0 auto",
      padding: compact ? "56px 32px 88px" : "88px 32px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      maxWidth: 620,
      margin: "0 auto 52px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ef-eyebrow",
    style: {
      marginBottom: 12
    }
  }, "Pricing"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 700,
      fontSize: 44,
      letterSpacing: "-0.025em",
      color: "var(--text-strong)",
      margin: "0 0 14px"
    }
  }, "Simple, scales with you"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 18,
      color: "var(--text-muted)",
      margin: 0
    }
  }, "Start free. Upgrade when your growth does. No credit card required.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 22,
      alignItems: "stretch"
    }
  }, plans.map(p => /*#__PURE__*/React.createElement(Card, {
    key: p.name,
    elevation: p.featured ? "lg" : "sm",
    padding: "28px",
    style: {
      display: "flex",
      flexDirection: "column",
      position: "relative",
      border: p.featured ? "2px solid var(--color-primary)" : "1px solid var(--border-subtle)"
    }
  }, p.featured && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: -12,
      left: 28
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    color: "primary",
    variant: "solid"
  }, "Most popular")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 600,
      fontSize: 20,
      color: "var(--text-strong)"
    }
  }, p.name), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 14,
      color: "var(--text-muted)",
      margin: "6px 0 18px"
    }
  }, p.blurb), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 4,
      marginBottom: 20
    }
  }, p.price === "Custom" ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 700,
      fontSize: 38,
      letterSpacing: "-0.02em",
      color: "var(--text-strong)"
    }
  }, "Custom") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 700,
      fontSize: 44,
      letterSpacing: "-0.02em",
      color: "var(--text-strong)"
    }
  }, "$", p.price), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)",
      fontSize: 15
    }
  }, "/mo"))), /*#__PURE__*/React.createElement(Button, {
    variant: p.featured ? "solid" : "outline",
    fullWidth: true
  }, p.cta), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 11,
      marginTop: 22
    }
  }, p.feats.map(f => /*#__PURE__*/React.createElement("div", {
    key: f,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontFamily: "var(--font-body)",
      fontSize: 14,
      color: "var(--text-body)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      color: "var(--color-success)",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Check, {
    size: 17
  })), f))))))));
}
window.PricingSection = PricingSection;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Pricing.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/SiteHeader.jsx
try { (() => {
/* Efeonce marketing — site header */
function SiteHeader({
  onNav,
  active
}) {
  const {
    Button
  } = window.EfeonceDesignSystem_01d769;
  const links = ["Product", "Solutions", "Pricing", "Resources"];
  const headerStyles = {
    bar: {
      position: "sticky",
      top: 0,
      zIndex: 40,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 72,
      padding: "0 32px",
      background: "rgba(255,255,255,0.82)",
      backdropFilter: "saturate(180%) blur(12px)",
      WebkitBackdropFilter: "saturate(180%) blur(12px)",
      borderBottom: "1px solid var(--border-subtle)"
    },
    nav: {
      display: "flex",
      alignItems: "center",
      gap: 28
    },
    link: on => ({
      fontFamily: "var(--font-body)",
      fontSize: 15,
      fontWeight: 500,
      color: on ? "var(--color-primary)" : "var(--text-body)",
      cursor: "pointer",
      background: "none",
      border: "none",
      padding: 0
    })
  };
  return /*#__PURE__*/React.createElement("header", {
    style: headerStyles.bar
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 40
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo.png",
    alt: "Efeonce",
    style: {
      height: 30,
      cursor: "pointer"
    },
    onClick: () => onNav("home")
  }), /*#__PURE__*/React.createElement("nav", {
    style: headerStyles.nav
  }, links.map(l => /*#__PURE__*/React.createElement("button", {
    key: l,
    style: headerStyles.link(l === "Pricing" && active === "pricing"),
    onClick: () => onNav(l === "Pricing" ? "pricing" : "home")
  }, l)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm"
  }, "Sign in"), /*#__PURE__*/React.createElement(Button, {
    variant: "solid",
    size: "sm"
  }, "Start free")));
}
window.SiteHeader = SiteHeader;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/SiteHeader.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/StudioBottom.jsx
try { (() => {
/* Efeonce — Studio page (bottom): process, geometric band, awards, CTA, footer */

function Process() {
  const cols = [{
    n: "01. RESEARCH AND STRATEGY",
    t: "User Research, Goal Definition, Information Architecture (IA)",
    d: "User Research: Conduct interviews, surveys, and competitive analysis to understand user behavior, pain points, and motivations. Define the product's vision, key performance indicators (KPIs), and success metrics."
  }, {
    n: "02. DESIGN",
    t: "Wireframes Creation, Prototyping",
    d: "Visual Design (Hi-fi mockups): Apply visual design and typography to create high-fidelity, branded interfaces ready for development."
  }, {
    n: "03. DELIVERY",
    t: "Design Iteration, Specifications",
    d: "Hand off annotated design specifications (redline / spec notes) for clean, accurate implementation and documentation."
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: "84px 40px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 36
    }
  }, cols.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.n,
    style: {
      borderTop: "1px solid var(--border-default)",
      paddingTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.08em",
      color: "var(--color-primary)",
      marginBottom: 12
    }
  }, c.n), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 700,
      fontSize: 21,
      lineHeight: 1.2,
      letterSpacing: "-0.015em",
      color: "var(--text-strong)",
      margin: "0 0 12px"
    }
  }, c.t), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 13.5,
      lineHeight: 1.6,
      color: "var(--text-muted)",
      margin: 0
    }
  }, c.d)))));
}
window.Process = Process;
function GeoBand() {
  const tiles = ["var(--blue-ink)", "var(--orange)", "var(--blue)", "var(--magenta)", "var(--green)", "var(--purple)"];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: 1200,
      margin: "40px auto 0",
      padding: "0 40px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 14
    }
  }, tiles.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      position: "relative",
      height: 230,
      borderRadius: 4,
      overflow: "hidden",
      background: "color-mix(in srgb, " + c + " 16%, white)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 200 200",
    width: "100%",
    height: "100%",
    preserveAspectRatio: "xMidYMid slice"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: i % 2 ? 150 : 50,
    cy: "60",
    r: "34",
    fill: c,
    opacity: "0.9"
  }), /*#__PURE__*/React.createElement("rect", {
    x: i % 2 ? 30 : 110,
    y: "110",
    width: "60",
    height: "60",
    rx: "6",
    fill: c,
    opacity: "0.55"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20 180 Q60 120 120 170",
    fill: "none",
    stroke: c,
    strokeWidth: "8",
    strokeLinecap: "round"
  }))))));
}
window.GeoBand = GeoBand;
function Awards() {
  const list = [{
    logo: "Webby",
    t: "The Webby Awards",
    s: "3 × Webby Winner"
  }, {
    logo: "W.",
    t: "Awwwards",
    s: "10 × Site Of The Day"
  }, {
    logo: "FWA",
    t: "The FWA Awards",
    s: "4 × FWA Of The Day"
  }, {
    logo: "Bē",
    t: "The Behance",
    s: "13 × Graphic Design"
  }, {
    logo: "dezeen",
    t: "Dezeen Awards",
    s: "2 × Design Nominee"
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: "84px 40px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1.2fr",
      gap: 48
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ef-eyebrow",
    style: {
      marginBottom: 18,
      color: "var(--text-subtle)"
    }
  }, "Awards and recognition"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 700,
      fontSize: 40,
      lineHeight: 1.1,
      letterSpacing: "-0.03em",
      color: "var(--text-strong)",
      margin: 0,
      maxWidth: 320
    }
  }, "The awards won by our projects.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 15,
      lineHeight: 1.6,
      color: "var(--text-muted)",
      margin: "0 0 32px"
    }
  }, "We are proud recipients of the award from the ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "var(--text-strong)"
    }
  }, "Global Tech Foundation"), ", acknowledging our commitment to environmentally conscious design. These accolades confirm the project's excellence in both technical execution and market viability."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "28px 24px"
    }
  }, list.map(a => /*#__PURE__*/React.createElement("div", {
    key: a.t
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 800,
      fontSize: 22,
      letterSpacing: "-0.02em",
      color: "var(--text-strong)",
      marginBottom: 8
    }
  }, a.logo), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 600,
      fontSize: 14,
      color: "var(--text-strong)"
    }
  }, a.t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 13,
      color: "var(--text-muted)"
    }
  }, a.s)))))));
}
window.Awards = Awards;
function StudioCTA() {
  const {
    Button
  } = window.EfeonceDesignSystem_01d769;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--surface-subtle)",
      borderTop: "1px solid var(--border-subtle)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: "72px 40px",
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: 40,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ef-eyebrow",
    style: {
      marginBottom: 16,
      color: "var(--text-subtle)"
    }
  }, "Collaboration"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 700,
      fontSize: 44,
      lineHeight: 1.05,
      letterSpacing: "-0.03em",
      color: "var(--text-strong)",
      margin: "0 0 18px"
    }
  }, "Got a project?", /*#__PURE__*/React.createElement("br", null), "Let's talk."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 15,
      lineHeight: 1.6,
      color: "var(--text-muted)",
      margin: 0,
      maxWidth: 460
    }
  }, "We're a team of creatives who are excited about unique ideas and help fin-tech companies create amazing identities by crafting superior UI/UX.")), /*#__PURE__*/React.createElement(Button, {
    variant: "solid",
    tone: "neutral",
    size: "lg",
    iconAfter: /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("line", {
      x1: "5",
      y1: "12",
      x2: "19",
      y2: "12"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "12 5 19 12 12 19"
    }))
  }, "Contact Us")));
}
window.StudioCTA = StudioCTA;
function StudioFooter() {
  const cols = [["Features", ["Complete Solutions", "Demo Templates", "Online Store", "Write a Blog", "Showcase Projects"]], ["Resources", ["Help Center", "Submit a New Request", "Customer's Reviews", "Get Figma Source Files"]], ["Documentation", ["Release Notes", "Getting Started Guide", "Basic Site Setup", "Tips & Tricks", "Still have Qs? FAQs"]]];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: "var(--blue-ink)",
      color: "rgba(255,255,255,0.66)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: "60px 40px 36px",
      display: "grid",
      gridTemplateColumns: "1.5fr 1fr 1fr 1.3fr",
      gap: 40
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-white.png",
    alt: "Efeonce",
    style: {
      height: 26,
      marginBottom: 18
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      fontFamily: "var(--font-body)",
      fontSize: 13,
      fontWeight: 600,
      color: "rgba(255,255,255,0.8)",
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("span", null, "Fb."), /*#__PURE__*/React.createElement("span", null, "Ig."), /*#__PURE__*/React.createElement("span", null, "Tw."), /*#__PURE__*/React.createElement("span", null, "Be.")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 13.5,
      lineHeight: 1.6,
      color: "rgba(255,255,255,0.5)",
      maxWidth: 240,
      margin: 0
    }
  }, "Our extensive library of templates and UI elements allows for effortless setup with single-click installation.")), cols.map(([h, items]) => /*#__PURE__*/React.createElement("div", {
    key: h
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 600,
      fontSize: 14,
      color: "#fff",
      marginBottom: 14
    }
  }, h), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, items.map(it => /*#__PURE__*/React.createElement("a", {
    key: it,
    href: "#",
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 13.5,
      color: "rgba(255,255,255,0.6)",
      textDecoration: "none"
    }
  }, it)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: "0 40px 28px"
    }
  }, /*#__PURE__*/React.createElement(Newsletter, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid rgba(255,255,255,0.12)",
      padding: "20px 40px",
      maxWidth: 1200,
      margin: "0 auto",
      fontFamily: "var(--font-body)",
      fontSize: 12.5,
      color: "rgba(255,255,255,0.45)",
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2019\u20132026 Efeonce. All rights reserved. We use cookies."), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("span", null, "Sitemap"), /*#__PURE__*/React.createElement("span", null, "Security"), /*#__PURE__*/React.createElement("span", null, "Privacy & Cookie Policy"), /*#__PURE__*/React.createElement("span", null, "Terms of Service"))));
}
function Newsletter() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid rgba(255,255,255,0.12)",
      paddingTop: 28,
      display: "flex",
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 360,
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 600,
      fontSize: 14,
      color: "#fff",
      marginBottom: 12
    }
  }, "Sign up for the newsletter"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    placeholder: "Enter your email",
    style: {
      flex: 1,
      height: 44,
      padding: "0 14px",
      borderRadius: "var(--radius-md)",
      border: "2px solid rgba(255,255,255,0.18)",
      background: "rgba(255,255,255,0.06)",
      color: "#fff",
      fontFamily: "var(--font-body)",
      fontSize: 14,
      outline: "none"
    }
  }), /*#__PURE__*/React.createElement("button", {
    style: {
      height: 44,
      padding: "0 20px",
      borderRadius: "var(--radius-md)",
      border: "none",
      background: "var(--color-primary)",
      color: "#fff",
      fontFamily: "var(--font-title)",
      fontWeight: 600,
      fontSize: 14,
      cursor: "pointer"
    }
  }, "Sign up")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 11.5,
      lineHeight: 1.5,
      color: "rgba(255,255,255,0.4)",
      marginTop: 10
    }
  }, "By sending this message, I agree that the data provided may be processed and used for the purpose of sending the newsletter.")));
}
window.StudioFooter = StudioFooter;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/StudioBottom.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/StudioMid.jsx
try { (() => {
/* Efeonce — Studio page (mid): portfolio grid, app showcase, solutions, logos */

function PlayBtn({
  light
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: 56,
      height: 56,
      borderRadius: "50%",
      alignItems: "center",
      justifyContent: "center",
      background: light ? "rgba(255,255,255,0.9)" : "var(--blue-ink)",
      color: light ? "var(--blue-ink)" : "#fff",
      boxShadow: "var(--shadow-md)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "6 4 20 12 6 20 6 4"
  })));
}
function ProjectTile({
  bg,
  label,
  sub,
  dark,
  flex,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      flex,
      minHeight: 360,
      borderRadius: 0,
      overflow: "hidden",
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, children, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 24,
      bottom: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 700,
      fontSize: 18,
      letterSpacing: "-0.01em",
      color: dark ? "#fff" : "var(--text-strong)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 13,
      color: dark ? "rgba(255,255,255,0.75)" : "var(--text-muted)"
    }
  }, sub)));
}
function PortfolioGrid() {
  return /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(ProjectTile, {
    flex: "1",
    bg: "linear-gradient(135deg, var(--orange-100), #f9c7b0)",
    label: "Dise\xF1o Gr\xE1fico",
    sub: "Websites, WordPress"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 180,
      height: 116,
      borderRadius: 14,
      background: "#fff",
      boxShadow: "var(--shadow-lg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--neutral-300)",
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      letterSpacing: "0.1em"
    }
  }, "CREDIT CARD"), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute"
    }
  }, /*#__PURE__*/React.createElement(PlayBtn, null))), /*#__PURE__*/React.createElement(ProjectTile, {
    flex: "1.7",
    dark: true,
    bg: "radial-gradient(120% 120% at 70% 10%, var(--blue-deep), var(--blue-ink))",
    label: "Dise\xF1o Gr\xE1fico",
    sub: "Websites, WordPress"
  }, /*#__PURE__*/React.createElement(GeoConstellation, null), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute"
    }
  }, /*#__PURE__*/React.createElement(PlayBtn, {
    light: true
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(ProjectTile, {
    flex: "1.7",
    bg: "linear-gradient(135deg, #d6f5e8, var(--green-100))",
    label: "Dise\xF1o Gr\xE1fico",
    sub: "Websites, WordPress"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 18
    }
  }, [["Best Route", "var(--blue)"], ["Run, don't Walk!", "var(--purple)"], ["Let's Bike", "var(--magenta)"]].map(([t, c]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      width: 132,
      height: 230,
      borderRadius: 18,
      background: "#fff",
      boxShadow: "var(--shadow-lg)",
      padding: 14,
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      borderRadius: 12,
      background: "color-mix(in srgb, " + c + " 14%, white)",
      marginBottom: 12
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 700,
      fontSize: 13,
      color: "var(--text-strong)"
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 9,
      color: "var(--text-subtle)",
      lineHeight: 1.5,
      marginTop: 4
    }
  }, "Lorem ipsum dolor sit amet, consectetur adipiscing elit."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      marginTop: 8
    }
  }, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 5,
      height: 5,
      borderRadius: "50%",
      background: i === 0 ? c : "var(--neutral-200)"
    }
  })))))), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute"
    }
  }, /*#__PURE__*/React.createElement(PlayBtn, null))), /*#__PURE__*/React.createElement(ProjectTile, {
    flex: "1",
    bg: "linear-gradient(135deg, #fbe9e2, var(--orange-100))",
    label: "Dise\xF1o Gr\xE1fico",
    sub: "Websites, WordPress"
  }, /*#__PURE__*/React.createElement(GeoDots, null))));
}
function GeoConstellation() {
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 400 300",
    width: "80%",
    height: "80%",
    style: {
      opacity: 0.9
    }
  }, [60, 200, 340].map((cx, i) => /*#__PURE__*/React.createElement("g", {
    key: i
  }, /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: 150,
    r: 46,
    fill: "none",
    stroke: "rgba(255,255,255,0.5)",
    strokeWidth: "2"
  }), /*#__PURE__*/React.createElement("line", {
    x1: cx,
    y1: 104,
    x2: cx,
    y2: 196,
    stroke: "var(--orange)",
    strokeWidth: "6",
    strokeLinecap: "round"
  }))));
}
function GeoDots() {
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 300 300",
    width: "78%",
    height: "78%"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "150",
    cy: "150",
    r: "70",
    fill: "var(--orange)"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "210",
    cy: "90",
    r: "22",
    fill: "var(--blue-ink)"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M40 250 Q90 200 60 160",
    fill: "none",
    stroke: "var(--magenta)",
    strokeWidth: "6",
    strokeLinecap: "round"
  }));
}
window.PortfolioGrid = PortfolioGrid;
function Solutions() {
  const items = [{
    type: "dash",
    t: "Website & Mobile UX Design"
  }, {
    type: "dash",
    t: "Defining a unified aesthetic vision and strategic direction to ensure brand consistency and market differentiation across all touchpoints, from digital platforms and product packaging to physical retail spaces."
  }, {
    type: "plus",
    t: "Photography & Visual Storytelling"
  }, {
    type: "plus",
    t: "Art Direction & Brand Strategy"
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: "84px 40px 40px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ef-eyebrow",
    style: {
      marginBottom: 18,
      color: "var(--text-subtle)"
    }
  }, "Capabilities"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 700,
      fontSize: 42,
      lineHeight: 1.1,
      letterSpacing: "-0.03em",
      color: "var(--text-strong)",
      margin: "0 0 48px",
      maxWidth: 460
    }
  }, "Solutions for today, thinking for tomorrow."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 0,
      alignItems: "stretch"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(135deg, var(--blue-100), var(--neutral-100))",
      minHeight: 420,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      padding: 30
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height: "100%",
      borderRadius: 8,
      background: "repeating-linear-gradient(135deg, rgba(2,42,78,0.06) 0 14px, transparent 14px 28px), var(--neutral-200)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--neutral-500)",
      fontFamily: "var(--font-body)",
      fontSize: 13
    }
  }, "Team photo")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface-card)",
      boxShadow: "var(--shadow-lg)",
      padding: "42px 44px",
      marginLeft: -40,
      marginTop: 40,
      marginBottom: 40,
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement(PlayBtn, null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 14,
      fontWeight: 600,
      color: "var(--text-body)"
    }
  }, "Play Showreel")), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 700,
      fontSize: 30,
      lineHeight: 1.18,
      letterSpacing: "-0.025em",
      color: "var(--text-strong)",
      margin: "0 0 18px"
    }
  }, "Our creative studio is dedicated to finding innovative solutions for complex issues."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 15,
      lineHeight: 1.6,
      color: "var(--text-muted)",
      margin: "0 0 20px"
    }
  }, "By leveraging a full-stack architecture, we deliver an incredibly robust and scalable solution tailored to enterprise needs."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      borderTop: "1px solid var(--border-subtle)",
      paddingTop: 14,
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-primary)",
      flexShrink: 0,
      marginTop: 1
    }
  }, it.type === "plus" ? /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "5",
    x2: "12",
    y2: "19"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "5",
    y1: "12",
    x2: "19",
    y2: "12"
  })) : /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "5",
    y1: "12",
    x2: "19",
    y2: "12"
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 14,
      lineHeight: 1.55,
      color: i === 1 ? "var(--text-muted)" : "var(--text-strong)",
      fontWeight: i === 1 ? 400 : 600
    }
  }, it.t)))))));
}
window.Solutions = Solutions;
function LogoWall() {
  const row1 = ["Jeep", "EA", "amazon", "slack", "VISA", "Hertz"];
  const row2 = ["zoom", "Linkedin", "Google", "lyft", "Spotify", "intel"];
  const cell = n => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "26px 0",
      fontFamily: "var(--font-title)",
      fontWeight: 800,
      fontSize: 24,
      letterSpacing: "-0.03em",
      color: "var(--neutral-700)"
    }
  }, n);
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--surface-subtle)",
      borderTop: "1px solid var(--border-subtle)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1100,
      margin: "0 auto",
      padding: "30px 40px",
      display: "grid",
      gridTemplateColumns: "repeat(6,1fr)",
      gap: 8
    }
  }, row1.map(cell), row2.map(cell)));
}
window.LogoWall = LogoWall;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/StudioMid.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/StudioTop.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Efeonce — Studio page (top): nav, hero, services, portfolio, app cards */

function StudioNav() {
  const {
    Button
  } = window.EfeonceDesignSystem_01d769;
  const links = ["Our Studio", "Works", "Services", "Insights", "Careers", "Contact", "Changelog"];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 40,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 76,
      padding: "0 40px",
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "saturate(180%) blur(12px)",
      WebkitBackdropFilter: "saturate(180%) blur(12px)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: 38,
      height: 38,
      borderRadius: 10,
      background: "var(--blue-ink)",
      color: "#fff",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "4",
    y1: "7",
    x2: "20",
    y2: "7"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "4",
    y1: "12",
    x2: "20",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "4",
    y1: "17",
    x2: "20",
    y2: "17"
  }))), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo.png",
    alt: "Efeonce",
    style: {
      height: 26
    }
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      gap: 26,
      alignItems: "center"
    }
  }, links.map(l => /*#__PURE__*/React.createElement("span", {
    key: l,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontFamily: "var(--font-body)",
      fontSize: 14.5,
      fontWeight: 500,
      color: "var(--text-body)",
      cursor: "pointer"
    }
  }, l, l === "Changelog" && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: "0.06em",
      color: "var(--color-primary)",
      border: "1px solid var(--color-primary)",
      borderRadius: 999,
      padding: "1px 5px"
    }
  }, "NEW")))), /*#__PURE__*/React.createElement(Button, {
    variant: "solid",
    tone: "neutral",
    size: "sm"
  }, "Let's talk"));
}
window.StudioNav = StudioNav;
function StudioHero() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: "relative",
      maxWidth: 1200,
      margin: "0 auto",
      padding: "70px 40px 56px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 40,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 14,
      fontWeight: 600,
      color: "var(--text-muted)",
      marginBottom: 18
    }
  }, "We are proud of", /*#__PURE__*/React.createElement("br", null), "the works we've done."), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 700,
      fontSize: 92,
      lineHeight: 0.98,
      letterSpacing: "-0.04em",
      color: "var(--text-strong)",
      margin: 0
    }
  }, "We're", /*#__PURE__*/React.createElement("br", null), "design", /*#__PURE__*/React.createElement("br", null), "creators."), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      marginTop: 32,
      fontFamily: "var(--font-body)",
      fontSize: 15,
      fontWeight: 600,
      color: "var(--text-strong)",
      textDecoration: "none"
    }
  }, "More Projects", /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "5",
    y1: "12",
    x2: "19",
    y2: "12"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "12 5 19 12 12 19"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height: 460,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ef-blob",
    style: {
      width: 420,
      height: 420,
      marginLeft: "auto",
      borderRadius: "62% 38% 54% 46% / 49% 56% 44% 51%",
      background: "conic-gradient(from 220deg at 60% 40%, var(--blue) 0deg, var(--blue-300) 60deg, var(--purple) 140deg, var(--magenta) 210deg, var(--orange) 280deg, var(--blue) 360deg)",
      filter: "blur(2px)",
      boxShadow: "0 40px 90px rgba(4,117,219,0.30)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      bottom: 30,
      maxWidth: 220
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 13,
      color: "var(--text-muted)",
      marginBottom: 4
    }
  }, "Featured project:"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 700,
      fontSize: 18,
      letterSpacing: "-0.02em",
      color: "var(--text-strong)"
    }
  }, "Unique Bowls From the South Pacific.")))));
}
window.StudioHero = StudioHero;
function StudioServices() {
  const cols = [{
    k: "STRATEGY",
    t: "Brand Strategy, Art Direction",
    d: "By leveraging a full-stack approach, we deliver an incredibly robust and scalable solution tailored to enterprise needs."
  }, {
    k: "DESIGN",
    t: "UX/UI Design, Website/App Design",
    d: "Intuitive and engaging digital experiences by merging user-centric design with stunning, brand-aligned UX."
  }, {
    k: "PRODUCTION",
    t: "Typography, Video Production",
    d: "We implement and configure Google Analytics and robust measurement strategies for business owners."
  }, {
    k: "CAMPAIGNS",
    t: "Promo Campaigns, Content Creation",
    d: "High-quality content creation to attract and engage your target audience."
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--surface-subtle)",
      borderTop: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: "72px 40px",
      display: "grid",
      gridTemplateColumns: "1.15fr 1fr 1fr",
      gap: 40
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ef-eyebrow",
    style: {
      marginBottom: 22,
      borderTop: "2px solid var(--text-strong)",
      paddingTop: 14,
      display: "inline-block",
      color: "var(--text-strong)"
    }
  }, "Services"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 700,
      fontSize: 38,
      lineHeight: 1.12,
      letterSpacing: "-0.025em",
      color: "var(--text-strong)",
      margin: 0
    }
  }, "We help to create design and strategies, leveraging our deep industry expertise.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 36
    }
  }, [cols[0], cols[2]].map(c => /*#__PURE__*/React.createElement(ServiceItem, _extends({
    key: c.k
  }, c)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 36
    }
  }, [cols[1], cols[3]].map(c => /*#__PURE__*/React.createElement(ServiceItem, _extends({
    key: c.k
  }, c))))));
}
function ServiceItem({
  k,
  t,
  d
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-default)",
      paddingTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.08em",
      color: "var(--text-subtle)",
      marginBottom: 10
    }
  }, k), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: "var(--font-title)",
      fontWeight: 700,
      fontSize: 19,
      letterSpacing: "-0.01em",
      color: "var(--text-strong)",
      margin: "0 0 10px"
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 14,
      lineHeight: 1.55,
      color: "var(--text-muted)",
      margin: 0
    }
  }, d));
}
window.StudioServices = StudioServices;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/StudioTop.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/icons.jsx
try { (() => {
/* Efeonce UI kit — curated icon set (Lucide geometry, stroke 2, rounded).
   Exposed on window for sibling babel scripts. */
(function () {
  const I = paths => (props = {}) => {
    const {
      size = 24,
      stroke = "currentColor",
      strokeWidth = 2,
      style = {},
      ...rest
    } = props;
    return React.createElement("svg", {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke,
      strokeWidth,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      style,
      ...rest
    }, paths.map((d, i) => React.createElement("path", {
      key: i,
      d
    })));
  };
  const C = children => (props = {}) => {
    const {
      size = 24,
      stroke = "currentColor",
      strokeWidth = 2,
      style = {},
      ...rest
    } = props;
    return React.createElement("svg", {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke,
      strokeWidth,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      style,
      ...rest
    }, children);
  };
  const e = React.createElement;
  window.EfIcons = {
    Rocket: I(["M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z", "M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z", "M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0", "M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"]),
    Bolt: C([e("path", {
      key: 0,
      d: "M13 2 3 14h9l-1 8 10-12h-9l1-8z"
    })]),
    Chart: C([e("path", {
      key: 0,
      d: "M3 3v18h18"
    }), e("path", {
      key: 1,
      d: "m19 9-5 5-4-4-3 3"
    })]),
    Shield: C([e("path", {
      key: 0,
      d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
    }), e("path", {
      key: 1,
      d: "m9 12 2 2 4-4"
    })]),
    Users: C([e("path", {
      key: 0,
      d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
    }), e("circle", {
      key: 1,
      cx: 9,
      cy: 7,
      r: 4
    }), e("path", {
      key: 2,
      d: "M22 21v-2a4 4 0 0 0-3-3.87"
    }), e("path", {
      key: 3,
      d: "M16 3.13a4 4 0 0 1 0 7.75"
    })]),
    Globe: C([e("circle", {
      key: 0,
      cx: 12,
      cy: 12,
      r: 10
    }), e("path", {
      key: 1,
      d: "M2 12h20"
    }), e("path", {
      key: 2,
      d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
    })]),
    Check: C([e("polyline", {
      key: 0,
      points: "20 6 9 17 4 12"
    })]),
    Arrow: C([e("line", {
      key: 0,
      x1: 5,
      y1: 12,
      x2: 19,
      y2: 12
    }), e("polyline", {
      key: 1,
      points: "12 5 19 12 12 19"
    })]),
    Menu: C([e("line", {
      key: 0,
      x1: 4,
      y1: 6,
      x2: 20,
      y2: 6
    }), e("line", {
      key: 1,
      x1: 4,
      y1: 12,
      x2: 20,
      y2: 12
    }), e("line", {
      key: 2,
      x1: 4,
      y1: 18,
      x2: 20,
      y2: 18
    })]),
    Star: C([e("polygon", {
      key: 0,
      points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
    })]),
    Sparkle: C([e("path", {
      key: 0,
      d: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"
    })]),
    Layers: C([e("polygon", {
      key: 0,
      points: "12 2 2 7 12 12 22 7 12 2"
    }), e("polyline", {
      key: 1,
      points: "2 17 12 22 22 17"
    }), e("polyline", {
      key: 2,
      points: "2 12 12 17 22 12"
    })]),
    Zap: C([e("polygon", {
      key: 0,
      points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2"
    })])
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/icons.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.Progress = __ds_scope.Progress;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Accordion = __ds_scope.Accordion;

__ds_ns.Pagination = __ds_scope.Pagination;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
