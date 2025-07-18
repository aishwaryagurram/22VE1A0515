import React, { useState, useEffect } from 'react';
import storageService from '../services/storageService.js';
import logger from '../services/logger.js';
import { formatDate, getTimeRemaining, isUrlValid } from '../utils/dataModels.js';

const StatisticsPage = () => {
  const [urls, setUrls] = useState([]);
  const [clicks, setClicks] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    logger.userAction('Visited statistics page');
  }, []);

  const loadData = () => {
    setLoading(true);
    try {
      const allUrls = storageService.getAllUrls();
      const allClicks = storageService.getAllClicks();
      
      setUrls(allUrls);
      setClicks(allClicks);
      
      logger.info('Statistics data loaded', { 
        urlCount: allUrls.length, 
        clickCount: allClicks.length 
      });
    } catch (error) {
      logger.error('Failed to load statistics data', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAndSortedUrls = () => {
    let filteredUrls = [...urls];

    if (filterStatus === 'active') {
      filteredUrls = filteredUrls.filter(url => isUrlValid(url));
    } else if (filterStatus === 'expired') {
      filteredUrls = filteredUrls.filter(url => !isUrlValid(url));
    }
    filteredUrls.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'expiryTime') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filteredUrls;
  };

  const getClicksForUrl = (shortcode) => {
    return clicks.filter(click => click.shortcode === shortcode);
  };

  const getTotalClicks = () => {
    return urls.reduce((total, url) => total + (url.totalClicks || 0), 0);
  };

  const getMostClickedUrl = () => {
    return urls.reduce((max, url) =>
      (url.totalClicks || 0) > (max.totalClicks || 0) ? url : max,
      urls[0] || null
    );
  };

  const handleUrlSelect = (url) => {
    setSelectedUrl(url);
    logger.userAction('Selected URL for detailed view', { shortcode: url.shortcode });
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      logger.userAction('Copied URL from statistics', { url: text });
    } catch (error) {
      logger.error('Failed to copy URL', error.message);
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      storageService.clearAllData();
      setUrls([]);
      setClicks([]);
      setSelectedUrl(null);
      logger.userAction('Cleared all data from statistics page');
    }
  };

  if (loading) {
    return (
      <div className="statistics-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  const filteredUrls = getFilteredAndSortedUrls();
  const totalClicks = getTotalClicks();
  const mostClickedUrl = getMostClickedUrl();

  return (
    <div className="statistics-page">
      <header className="page-header">
        <h1>URL Statistics</h1>
        <p className="page-subtitle">
          Comprehensive analytics for all your shortened URLs
        </p>
      </header>

      {urls.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No URLs Found</h3>
          <p>You haven't shortened any URLs yet. <a href="/">Create your first short URL</a> to see statistics here.</p>
        </div>
      ) : (
        <main className="page-content">
          {/* Summary Statistics */}
          <section className="summary-stats">
            <h2>Summary</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{urls.length}</div>
                <div className="stat-label">Total URLs</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{urls.filter(url => isUrlValid(url)).length}</div>
                <div className="stat-label">Active URLs</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{totalClicks}</div>
                <div className="stat-label">Total Clicks</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{mostClickedUrl ? mostClickedUrl.totalClicks || 0 : 0}</div>
                <div className="stat-label">Most Clicks</div>
                {mostClickedUrl && (
                  <div className="stat-detail">/{mostClickedUrl.shortcode}</div>
                )}
              </div>
            </div>
          </section>

          {/* Controls */}
          <section className="controls-section">
            <div className="controls-row">
              <div className="filter-controls">
                <label htmlFor="status-filter">Filter by Status:</label>
                <select
                  id="status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All URLs</option>
                  <option value="active">Active Only</option>
                  <option value="expired">Expired Only</option>
                </select>
              </div>

              <div className="sort-controls">
                <label htmlFor="sort-by">Sort by:</label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="createdAt">Created Date</option>
                  <option value="expiryTime">Expiry Date</option>
                  <option value="totalClicks">Click Count</option>
                  <option value="shortcode">Shortcode</option>
                </select>
                
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="sort-order-button"
                  title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>

              <button
                onClick={handleClearAllData}
                className="clear-data-button"
                title="Clear all data"
              >
                Clear All Data
              </button>
            </div>
          </section>

          {/* URLs Table */}
          <section className="urls-section">
            <h2>URLs ({filteredUrls.length})</h2>
            <div className="urls-table-container">
              <table className="urls-table">
                <thead>
                  <tr>
                    <th>Short URL</th>
                    <th>Original URL</th>
                    <th>Created</th>
                    <th>Expires</th>
                    <th>Status</th>
                    <th>Clicks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUrls.map((url) => (
                    <tr key={url.id} className={!isUrlValid(url) ? 'expired' : ''}>
                      <td>
                        <button
                          onClick={() => copyToClipboard(url.shortUrl)}
                          className="short-url-link"
                          title="Click to copy"
                        >
                          /{url.shortcode}
                        </button>
                      </td>
                      <td>
                        <a 
                          href={url.longUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="long-url-link"
                          title={url.longUrl}
                        >
                          {url.longUrl.length > 50 
                            ? `${url.longUrl.substring(0, 50)}...` 
                            : url.longUrl
                          }
                        </a>
                      </td>
                      <td>{formatDate(url.createdAt)}</td>
                      <td>{formatDate(url.expiryTime)}</td>
                      <td>
                        <span className={`status-badge ${isUrlValid(url) ? 'active' : 'expired'}`}>
                          {isUrlValid(url) ? getTimeRemaining(url.expiryTime) : 'Expired'}
                        </span>
                      </td>
                      <td className="clicks-cell">{url.totalClicks || 0}</td>
                      <td>
                        <button
                          onClick={() => handleUrlSelect(url)}
                          className="details-button"
                          title="View details"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Detailed View Modal */}
          {selectedUrl && (
            <div className="modal-overlay" onClick={() => setSelectedUrl(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>URL Details: /{selectedUrl.shortcode}</h3>
                  <button
                    onClick={() => setSelectedUrl(null)}
                    className="close-button"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                <div className="modal-body">
                  <div className="url-details">
                    <div className="detail-row">
                      <label>Short URL:</label>
                      <span>{selectedUrl.shortUrl}</span>
                    </div>
                    <div className="detail-row">
                      <label>Original URL:</label>
                      <span>{selectedUrl.longUrl}</span>
                    </div>
                    <div className="detail-row">
                      <label>Created:</label>
                      <span>{formatDate(selectedUrl.createdAt)}</span>
                    </div>
                    <div className="detail-row">
                      <label>Expires:</label>
                      <span>{formatDate(selectedUrl.expiryTime)}</span>
                    </div>
                    <div className="detail-row">
                      <label>Status:</label>
                      <span className={`status-badge ${isUrlValid(selectedUrl) ? 'active' : 'expired'}`}>
                        {isUrlValid(selectedUrl) ? getTimeRemaining(selectedUrl.expiryTime) : 'Expired'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <label>Total Clicks:</label>
                      <span>{selectedUrl.totalClicks || 0}</span>
                    </div>
                  </div>

                  <div className="click-logs">
                    <h4>Click Logs</h4>
                    {getClicksForUrl(selectedUrl.shortcode).length === 0 ? (
                      <p className="no-clicks">No clicks recorded yet.</p>
                    ) : (
                      <div className="clicks-table-container">
                        <table className="clicks-table">
                          <thead>
                            <tr>
                              <th>Timestamp</th>
                              <th>Referrer</th>
                              <th>Location</th>
                              <th>IP Address</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getClicksForUrl(selectedUrl.shortcode).map((click) => (
                              <tr key={click.id}>
                                <td>{formatDate(click.timestamp)}</td>
                                <td>{click.referrer}</td>
                                <td>{click.location.city}, {click.location.country}</td>
                                <td>{click.ipAddress}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
};

export default StatisticsPage;
