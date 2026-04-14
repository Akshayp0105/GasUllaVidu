"use client";

import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  LayoutDashboard,
  Flame,
  Target,
  MessageSquare,
  ChevronRight,
  Loader2,
  LocateFixed,
} from 'lucide-react';
import { db } from '@/lib/firebase/client';
import {
  calculateDistanceKm,
  subscribeToListings,
  type ListingView,
} from '@/lib/firebase/listings';
import styles from './page.module.css';

type Coordinates = {
  latitude: number;
  longitude: number;
};

type ProjectedPoint = {
  id: string;
  x: number;
  y: number;
  intensity: number;
  brand: string;
  locationName: string;
};

function getMapBounds(points: Coordinates[]) {
  if (points.length === 0) {
    return null;
  }

  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const latPadding = Math.max((maxLatitude - minLatitude) * 0.18, 0.02);
  const lngPadding = Math.max((maxLongitude - minLongitude) * 0.18, 0.02);

  return {
    minLatitude: minLatitude - latPadding,
    maxLatitude: maxLatitude + latPadding,
    minLongitude: minLongitude - lngPadding,
    maxLongitude: maxLongitude + lngPadding,
  };
}

function projectCoordinate(point: Coordinates, bounds: ReturnType<typeof getMapBounds>) {
  if (!bounds) {
    return null;
  }

  const x =
    ((point.longitude - bounds.minLongitude) / (bounds.maxLongitude - bounds.minLongitude || 1)) * 100;
  const y =
    (1 - (point.latitude - bounds.minLatitude) / (bounds.maxLatitude - bounds.minLatitude || 1)) * 100;

  return {
    x: Math.min(94, Math.max(6, x)),
    y: Math.min(94, Math.max(6, y)),
  };
}

function getBrandClass(brand: string) {
  if (brand.includes('Indane')) return 'Indane';
  if (brand.includes('HP')) return 'HP';
  return 'Bharat';
}

export default function ListingsPageClient() {
  const [filter, setFilter] = useState('All Brands');
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<ListingView[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerLocation, setViewerLocation] = useState<Coordinates | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToListings(
      db,
      (nextListings) => {
        setListings(nextListings);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading listings:', error);
        setListings([]);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      const timeoutId = setTimeout(() => {
        setLocationError('Geolocation unavailable');
      }, 0);

      return () => clearTimeout(timeoutId);
    }

    const timeoutId = setTimeout(() => {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setViewerLocation({
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
          setLocating(false);
        },
        (error) => {
          setLocationError(error.message || 'Location access denied');
          setLocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      );
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  const searchableQuery = searchQuery.trim().toLowerCase();
  const liveListings = listings.map((listing) => {
    const hasCoordinates = listing.latitude !== null && listing.longitude !== null;
    const liveDistance =
      viewerLocation && hasCoordinates
        ? calculateDistanceKm(viewerLocation, {
            latitude: listing.latitude as number,
            longitude: listing.longitude as number,
          })
        : null;

    return {
      ...listing,
      liveDistance,
      distanceLabel: liveDistance !== null ? liveDistance.toFixed(1) : listing.distance,
      searchableText: `${listing.brand} ${listing.locationName} ${listing.weight}`.toLowerCase(),
    };
  });

  const filteredListings = liveListings.filter((item) => {
    const matchesBrand = filter === 'All Brands' || item.brand.includes(filter.split(' ')[0]);
    const matchesSearch = !searchableQuery || item.searchableText.includes(searchableQuery);
    return matchesBrand && matchesSearch;
  });

  const mappedListings = filteredListings.filter(
    (listing) => listing.latitude !== null && listing.longitude !== null,
  );

  const mapBounds = getMapBounds([
    ...mappedListings.map((listing) => ({
      latitude: listing.latitude as number,
      longitude: listing.longitude as number,
    })),
    ...(viewerLocation ? [viewerLocation] : []),
  ]);

  const projectedListings: ProjectedPoint[] = mappedListings
    .map((listing) => {
      const projected = projectCoordinate(
        {
          latitude: listing.latitude as number,
          longitude: listing.longitude as number,
        },
        mapBounds,
      );

      if (!projected) {
        return null;
      }

      return {
        id: listing.id,
        x: projected.x,
        y: projected.y,
        intensity: Math.max(0.35, Math.min(1, listing.level / 100)),
        brand: listing.brand,
        locationName: listing.locationName,
      };
    })
    .filter((point): point is ProjectedPoint => point !== null);

  const projectedViewer = viewerLocation ? projectCoordinate(viewerLocation, mapBounds) : null;

  return (
    <div className={styles.pageContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTitle}>Main Menu</div>
        <Link href="/dashboard" className={styles.sidebarItem}>
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link href="/listings" className={`${styles.sidebarItem} ${styles.active}`}>
          <Search size={20} /> Browse Inventory
        </Link>
        <Link href="/dashboard" className={styles.sidebarItem}>
          <Target size={20} /> My Listings
        </Link>
        <Link href="/dashboard" className={styles.sidebarItem}>
          <MessageSquare size={20} /> Encrypted Chat
        </Link>
        <Link href="#" className={`${styles.sidebarItem} ${styles.aiAssistant}`}>
          <Flame color="var(--accent-primary)" size={20} /> Ask AI Assistant
        </Link>
      </aside>

      <main className={styles.mainLayout}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <div className={styles.searchBar}>
              <Search size={20} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search by locality, city, or cylinder type..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <div className={styles.locationBadge}>
              {locating ? (
                <>
                  <Loader2 size={18} className={styles.spinIcon} color="var(--accent-primary)" />
                  Detecting location
                </>
              ) : viewerLocation ? (
                <>
                  <LocateFixed size={18} color="var(--accent-primary)" />
                  GPS Live
                </>
              ) : (
                <>
                  <MapPin size={18} color="var(--warning)" />
                  {locationError || 'Location unavailable'}
                </>
              )}
            </div>
          </div>

          <div className={styles.sectionHeader}>
            LIVE LOCAL INVENTORY ({filteredListings.length})
          </div>

          <div className={styles.filters}>
            {['All Brands', 'Indane (IOCL)', 'HP Gas', 'Bharat Gas'].map((item) => (
              <button
                key={item}
                className={`${styles.filterBtn} ${filter === item ? styles.active : ''}`}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className={styles.list}>
            {loading ? (
              <div className={styles.loaderWrap}>
                <Loader2 className={styles.spinIcon} size={32} color="var(--accent-primary)" />
              </div>
            ) : (
              <AnimatePresence>
                {filteredListings.map((listing, index) => {
                  const brandClass = getBrandClass(listing.brand);
                  return (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Link href={`/listings/${listing.id}`} className={styles.card}>
                        <div className={styles.cardLeft}>
                          <div className={`${styles.brandIcon} ${styles[brandClass]}`}>{brandClass[0]}</div>
                          <div>
                            <div className={styles.cardInfo}>
                              <h3>{listing.brand} Supply • {listing.weight}</h3>
                            </div>
                            <div className={styles.cardTags}>
                              <span
                                className={`badge ${listing.level === 100 ? 'badge-success' : 'badge-warning'}`}
                              >
                                {listing.condition}
                              </span>
                              <span className={styles.locationText}>
                                <MapPin size={14} /> {listing.locationName}
                              </span>
                              <span className={styles.distanceText}>{listing.distanceLabel} Km Away</span>
                            </div>
                            <div className={styles.levelBarContainer}>
                              <div className={styles.levelHeader}>
                                <span>Remaining Volume</span>
                                <span
                                  style={{
                                    color:
                                      listing.level === 100 ? 'var(--success)' : 'var(--warning)',
                                  }}
                                >
                                  {listing.level}%
                                </span>
                              </div>
                              <div className={styles.levelBar}>
                                <div
                                  className={styles.levelFill}
                                  style={{
                                    width: `${listing.level}%`,
                                    background:
                                      listing.level === 100 ? 'var(--success)' : 'var(--warning)',
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={styles.cardRight}>
                          <div className={styles.price}>
                            ₹{listing.price} <span>/ unit</span>
                          </div>
                          <div
                            className="btn btn-primary"
                            style={{ padding: '0.625rem 1.25rem', borderRadius: '10px' }}
                          >
                            View Details <ChevronRight size={16} />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
                {filteredListings.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.emptyState}>
                    No listings found for this brand or search query.
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>

        <div className={styles.mapArea}>
          <div className={styles.mapOverlay}>
            <div className={styles.radarDot}></div>
            Live heatmap
            <span className={styles.mapOverlayStat}>{projectedListings.length} plotted</span>
          </div>

          <div className={styles.mapSummary}>
            <div>
              <div className={styles.mapSummaryLabel}>Active LPG zones</div>
              <div className={styles.mapSummaryValue}>{projectedListings.length}</div>
            </div>
            <div>
              <div className={styles.mapSummaryLabel}>GPS status</div>
              <div className={styles.mapSummaryValueSmall}>{viewerLocation ? 'Locked' : 'Off'}</div>
            </div>
          </div>

          <div className={styles.mapStage}>
            <div className={styles.mapGlow}></div>
            <div className={styles.mapGrid}></div>

            {projectedListings.map((point) => (
              <motion.div
                key={point.id}
                className={`${styles.heatSpot} ${styles[getBrandClass(point.brand)]}`}
                style={
                  {
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    '--intensity': point.intensity.toString(),
                  } as CSSProperties
                }
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className={styles.heatHalo}></div>
                <div className={styles.heatDot}></div>
                <div className={styles.heatLabel}>
                  <strong>{point.brand}</strong>
                  <span>{point.locationName}</span>
                </div>
              </motion.div>
            ))}

            {projectedViewer && (
              <div
                className={styles.viewerMarker}
                style={{
                  left: `${projectedViewer.x}%`,
                  top: `${projectedViewer.y}%`,
                }}
              >
                <div className={styles.viewerPulse}></div>
                <div className={styles.viewerDot}></div>
                <span>You</span>
              </div>
            )}

            {!loading && projectedListings.length === 0 && (
              <div className={styles.mapEmpty}>
                <div>No geotagged listings match the current filters.</div>
                <span>New posts with GPS enabled appear here in real time.</span>
              </div>
            )}
          </div>

          <div className={styles.mapFooter}>
            <span>Heat intensity scales with reported cylinder fill level.</span>
            <span>Every plotted dot is a live listing from Firestore.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
