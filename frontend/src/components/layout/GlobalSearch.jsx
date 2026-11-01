// src/components/layout/GlobalSearch.jsx
// The one search box, in the top bar.
//  - On Contacts, Companies and Deals it filters that page's table as you type
//    (the text is kept in the address bar as ?q=...).
//  - On every other page it is a global finder: grouped results for contacts,
//    companies and deals. Arrows move, Enter opens, Esc closes.
// Ctrl+K (or Cmd+K) focuses it anywhere.

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Avatar from "../ui/Avatar";
import { useContacts } from "../../hooks/useContacts";
import { useCompanies } from "../../hooks/useCompanies";
import { useDeals } from "../../hooks/useDeals";
import { formatCurrency } from "../../utils/formatters";
import {
  colors,
  radius,
  shadows,
  spacing,
  fontSizes,
  fontWeights,
} from "../../styles/theme";

const MAX_PER_GROUP = 4;

const LIST_PAGES = {
  "/contacts": "contacts",
  "/companies": "companies",
  "/deals": "deals",
};

const styles = {
  wrapper: { position: "relative", width: "100%", maxWidth: 520, minWidth: 0 },
  icon: {
    position: "absolute",
    left: 13,
    top: "50%",
    transform: "translateY(-50%)",
    color: colors.textMuted,
    display: "flex",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "10px 64px 10px 38px",
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceMuted,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
  },
  hint: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    padding: "2px 7px",
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    color: colors.textMuted,
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    pointerEvents: "none",
  },
  clear: {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: "translateY(-50%)",
    width: 26,
    height: 26,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: "50%",
    backgroundColor: "transparent",
    color: colors.textMuted,
    fontSize: 18,
    lineHeight: 1,
    padding: 0,
  },
  panel: {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    maxHeight: 460,
    overflowY: "auto",
    padding: spacing.sm,
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.lg,
    boxShadow: shadows.lg,
    zIndex: 120,
  },
  groupLabel: {
    padding: `${spacing.sm}px ${spacing.md}px 4px`,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: colors.textMuted,
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: spacing.md,
    padding: "8px 12px",
    borderRadius: radius.md,
    cursor: "pointer",
  },
  itemActive: { backgroundColor: colors.primarySoft },
  itemText: { minWidth: 0 },
  itemTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.textPrimary,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  itemSubtitle: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  dealIcon: {
    width: 30,
    height: 30,
    minWidth: 30,
    borderRadius: "50%",
    backgroundColor: colors.primarySoft,
    color: colors.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    padding: spacing.xl,
    textAlign: "center",
    fontSize: fontSizes.md,
    color: colors.textMuted,
  },
};

function ResultIcon({ item }) {
  if (item.kind === "deal") {
    return (
      <span style={styles.dealIcon}>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      </span>
    );
  }
  return <Avatar name={item.title} size={30} />;
}

export default function GlobalSearch({ isMobile }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { contacts } = useContacts();
  const { companies } = useCompanies();
  const { deals } = useDeals();

  const listPageName = LIST_PAGES[pathname];
  const onListPage = Boolean(listPageName);

  const [localQuery, setLocalQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  // On list pages the text lives in the address bar and filters that page.
  // Everywhere else it is just a local search box.
  const query = onListPage ? searchParams.get("q") || "" : localQuery;

  function setQuery(next) {
    if (onListPage) {
      const params = new URLSearchParams(searchParams);
      if (next) params.set("q", next);
      else params.delete("q");
      setSearchParams(params, { replace: true });
    } else {
      setLocalQuery(next);
    }
  }

  const groups = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term || onListPage) return [];

    // Results that start with what you typed come first
    function pick(list, getText, toItem) {
      return list
        .filter((entry) => getText(entry).toLowerCase().includes(term))
        .sort((a, b) => {
          const aStarts = getText(a).toLowerCase().startsWith(term) ? 0 : 1;
          const bStarts = getText(b).toLowerCase().startsWith(term) ? 0 : 1;
          return aStarts - bStarts;
        })
        .slice(0, MAX_PER_GROUP)
        .map(toItem);
    }

    const built = [
      {
        label: "Contacts",
        items: pick(
          contacts,
          (c) => `${c.name} ${c.email} ${c.companyName}`,
          (c) => ({
            key: `contact-${c.id}`,
            kind: "contact",
            title: c.name,
            subtitle: [c.jobTitle, c.companyName].filter(Boolean).join(" · ") || c.email,
            to: `/contacts/${c.id}`,
          })
        ),
      },
      {
        label: "Companies",
        items: pick(
          companies,
          (c) => `${c.name} ${c.industry} ${c.city}`,
          (c) => ({
            key: `company-${c.id}`,
            kind: "company",
            title: c.name,
            subtitle: [c.industry, c.city].filter(Boolean).join(" · "),
            to: `/companies/${c.id}`,
          })
        ),
      },
      {
        label: "Deals",
        items: pick(
          deals,
          (d) => `${d.title} ${d.companyName} ${d.contactName}`,
          (d) => ({
            key: `deal-${d.id}`,
            kind: "deal",
            title: d.title,
            subtitle: [d.companyName, formatCurrency(d.value)].filter(Boolean).join(" · "),
            to: `/deals?q=${encodeURIComponent(d.title)}`,
          })
        ),
      },
    ].filter((group) => group.items.length > 0);

    // number the results so the arrow keys know which one is highlighted
    let index = 0;
    built.forEach((group) =>
      group.items.forEach((item) => {
        item.index = index;
        index += 1;
      })
    );
    return built;
  }, [query, onListPage, contacts, companies, deals]);

  const flat = groups.flatMap((group) => group.items);

  // Ctrl+K / Cmd+K focuses the search
  useEffect(() => {
    function handleShortcut(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current.focus();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  // Clicking anywhere else closes the results
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keep the highlighted result visible when you scroll with the arrows
  useEffect(() => {
    if (!open) return;
    const element = document.getElementById(`global-search-option-${active}`);
    if (element) element.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function go(item) {
    setLocalQuery("");
    navigate(item.to);
    setOpen(false);
    inputRef.current.blur();
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      if (onListPage && query) {
        setQuery("");
      } else {
        setOpen(false);
        inputRef.current.blur();
      }
      return;
    }

    if (onListPage) return; // the results list only exists on the other pages

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((current) => Math.min(current + 1, flat.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter") {
      if (flat[active]) {
        event.preventDefault();
        go(flat[active]);
      }
    }
  }

  const showPanel = !onListPage && open && query.trim().length > 0;

  const placeholder = onListPage
    ? `Search ${listPageName}...`
    : isMobile
      ? "Search..."
      : "Search contacts, companies, deals...";

  return (
    <div ref={wrapperRef} style={styles.wrapper}>
      <span style={styles.icon}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>

      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="global-search-results"
        aria-label={placeholder}
        placeholder={placeholder}
        value={query}
        style={styles.input}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />

      {query ? (
        <button
          type="button"
          className="btn-ghost"
          aria-label="Clear search"
          style={styles.clear}
          onClick={() => {
            setQuery("");
            inputRef.current.focus();
          }}
        >
          ×
        </button>
      ) : (
        !isMobile && <span style={styles.hint}>Ctrl K</span>
      )}

      {showPanel && (
        <div id="global-search-results" role="listbox" style={styles.panel}>
          {groups.length === 0 ? (
            <div style={styles.empty}>No results for “{query.trim()}”</div>
          ) : (
            groups.map((group) => (
              <div key={group.label}>
                <div style={styles.groupLabel}>{group.label}</div>
                {group.items.map((item) => (
                  <div
                    key={item.key}
                    id={`global-search-option-${item.index}`}
                    role="option"
                    aria-selected={item.index === active}
                    style={{
                      ...styles.item,
                      ...(item.index === active ? styles.itemActive : {}),
                    }}
                    onMouseEnter={() => setActive(item.index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => go(item)}
                  >
                    <ResultIcon item={item} />
                    <div style={styles.itemText}>
                      <div style={styles.itemTitle}>{item.title}</div>
                      {item.subtitle && <div style={styles.itemSubtitle}>{item.subtitle}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}