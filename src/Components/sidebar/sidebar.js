import React, { useContext, useState, useEffect } from 'react';
import './sidebar.css';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {


  return (
    <>
        <div className="sidebar px-4 py-4 py-md-5 me-0">
        <div className="d-flex flex-column h-100">
          <Link to="index" className="mb-0 brand-icon">
            <span className="logo-icon">
              <i className="icofont-file-document fs-2" />
            </span>
            <span className="logo-text">E-procurement</span>
          </Link>
          {/* Menu: main ul */}
          <ul className="menu-list flex-grow-1 mt-3">
            <li className="collapsed">
              <Link
                className="m-link active"
                data-bs-toggle="collapse"
                data-bs-target="#dashboard"
                to="#"
              >
                <i className="icofont-ui-home fs-5" /> <span>Dashboard</span>
                <span className="arrow icofont-rounded-down ms-auto text-end fs-5" />
              </Link>
              {/* Menu: Sub menu ul */}
              <ul className="sub-menu collapse show" id="dashboard">
                <li>
                  <Link className="ms-link active" to="dashboard">
                    Procurement Dashboard
                  </Link>
                </li>

              </ul>
            </li>
            <li>
              <Link className="m-link" to="mpr-list">
                <i className="icofont-clipboard fs-5" />
                <span>MPR Management</span>
              </Link>
            </li>
            <li className="collapsed">
              <Link
                className="m-link"
                data-bs-toggle="collapse"
                data-bs-target="#menu-Tender"
                to="#"
              >
                <i className="icofont-file-alt fs-5" /> <span>Tender Management</span>
                <span className="arrow icofont-rounded-down ms-auto text-end fs-5" />
              </Link>
              {/* Menu: Sub menu ul */}
              <ul className="sub-menu collapse" id="menu-Tender">
                <li>
                  <Link className="ms-link" to="tender-list">
                    All Tenders
                  </Link>
                </li>
                <li>
                  <Link className="ms-link" to="create-tender">
                    Create Tender
                  </Link>
                </li>
                <li>
                  <Link className="ms-link" to="prebid-queries">
                    Pre-Bid Queries
                  </Link>
                </li>
                <li>
                  <Link className="ms-link" to="bid-list">
                    Bid Management
                  </Link>
                </li>
                <li>
                  <Link className="ms-link" to="evaluation">
                    Evaluation & Award
                  </Link>
                </li>
              </ul>
            </li>
            <li className="collapsed">
              <Link
                className="m-link"
                data-bs-toggle="collapse"
                data-bs-target="#menu-Procurement"
                to="#"
              >
                <i className="icofont-shopping-cart fs-5" /> <span>Procurement Ops</span>
                <span className="arrow icofont-rounded-down ms-auto text-end fs-5" />
              </Link>
              {/* Menu: Sub menu ul */}
              <ul className="sub-menu collapse" id="menu-Procurement">
                <li>
                  <Link className="ms-link" to="purchase-orders">
                    Purchase Orders
                  </Link>
                </li>
                <li>
                  <Link className="ms-link" to="grn">
                    Goods Receipt (GRN)
                  </Link>
                </li>
                <li>
                  <Link className="ms-link" to="inventory">
                    Inventory Management
                  </Link>
                </li>
              </ul>
            </li>
            <li className="collapsed">
              <Link
                className="m-link"
                data-bs-toggle="collapse"
                data-bs-target="#menu-Vendor"
                to="#"
              >
                <i className="icofont-store fs-5" /> <span>Vendor Relations</span>
                <span className="arrow icofont-rounded-down ms-auto text-end fs-5" />
              </Link>
              {/* Menu: Sub menu ul */}
              <ul className="sub-menu collapse" id="menu-Vendor">
                <li>
                  <Link className="ms-link" to="vendor-dashboard">
                    Vendor Portal
                  </Link>
                </li>
                <li>
                  <Link className="ms-link" to="contracts">
                    Contracts & Payments
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link className="m-link" to="activity-logs">
                <i className="icofont-history fs-5" />
                <span>Audit Logs</span>
              </Link>
            </li>
            
          </ul>
          {/* Menu: menu collepce btn */}
          <button
            type="button"
            className="btn btn-link sidebar-mini-btn text-light"
          >
            <span className="ms-2">
              <i className="icofont-bubble-right" />
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
export default Sidebar;