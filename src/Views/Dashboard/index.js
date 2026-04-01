import React, { useEffect, useState } from "react";
import "./dashboard.css";
import ProfileImg from "../../assets/images/profile_av.png";

const Dashboard = () => {


  return (
    <>


            {/* Body: Body */}
            <div className="body d-flex py-3">
              <div className="container-xxl">
                
               

                
                
                {/* Procurement Status Section */}
                <div className="row g-3 mb-3 row-deck">
                  <div className="col-lg-12 col-xl-6">
                    <div className="card">
                      <div className="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
                        <h6 className="mb-0 fw-bold">Procurement Status</h6>
                        <div className="dropdown">
                          <a href="#" className="text-muted" data-bs-toggle="dropdown">
                            <i className="icofont-chart-line fs-5" />
                          </a>
                          <ul className="dropdown-menu dropdown-menu-end">
                            <li><a className="dropdown-item" href="#">This Month</a></li>
                            <li><a className="dropdown-item" href="#">Last Quarter</a></li>
                            <li><a className="dropdown-item" href="#">Year to Date</a></li>
                          </ul>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="row g-3 row-deck">
                          <div className="col-md-4 col-sm-6">
                            <div className="card">
                              <div className="card-body">
                                <i className="icofont-file-alt fs-3 text-secondary" />
                                <h6 className="mt-3 mb-0 fw-bold small-14">
                                  Total Tenders
                                </h6>
                                <span className="text-muted">12</span>
                                <div className="mt-2">
                                  <small className="text-success">+3 this month</small>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 col-sm-6">
                            <div className="card">
                              <div className="card-body">
                                <i className="icofont-clipboard fs-3 color-lightblue" />
                                <h6 className="mt-3 mb-0 fw-bold small-14">
                                  Active MPRs
                                </h6>
                                <span className="text-muted">8</span>
                                <div className="mt-2">
                                  <small className="text-warning">5 pending approval</small>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 col-sm-6">
                            <div className="card">
                              <div className="card-body">
                                <i className="icofont-envelope-open fs-3 color-light-orange" />
                                <h6 className="mt-3 mb-0 fw-bold small-14">
                                  Total Bids
                                </h6>
                                <span className="text-muted">24</span>
                                <div className="mt-2">
                                  <small className="text-info">12 under evaluation</small>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 col-sm-6">
                            <div className="card">
                              <div className="card-body">
                                <i className="icofont-file-invoice fs-3 color-careys-pink" />
                                <h6 className="mt-3 mb-0 fw-bold small-14">
                                  Purchase Orders
                                </h6>
                                <span className="text-muted">9</span>
                                <div className="mt-2">
                                  <small className="text-success">₹2.8Cr total value</small>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 col-sm-6">
                            <div className="card">
                              <div className="card-body">
                                <i className="icofont-warehouse fs-3 color-lavender-purple" />
                                <h6 className="mt-3 mb-0 fw-bold small-14">
                                  Inventory Items
                                </h6>
                                <span className="text-muted">156</span>
                                <div className="mt-2">
                                  <small className="text-danger">12 low stock alerts</small>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 col-sm-6">
                            <div className="card">
                              <div className="card-body">
                                <i className="icofont-contract fs-3 color-light-success" />
                                <h6 className="mt-3 mb-0 fw-bold small-14">
                                  Active Contracts
                                </h6>
                                <span className="text-muted">5</span>
                                <div className="mt-2">
                                  <small className="text-info">2 ending this quarter</small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-12 col-xl-6">
                    <div className="card">
                      <div className="card-header py-3 d-flex bg-transparent border-bottom-0">
                        <h6 className="mb-0 fw-bold">Tender Status Overview</h6>
                        <div className="ms-auto">
                          <span className="badge bg-success me-1">Published: 4</span>
                          <span className="badge bg-info">Evaluation: 3</span>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="room_book">
                          <div className="row row-cols-2 row-cols-sm-4 row-cols-md-6 row-cols-lg-6 g-3">
                            <div className="room col">
                              <input type="checkbox" id="1A" defaultChecked="" />
                              <label htmlFor="1A">
                                <i className="icofont-file-document fs-2" />
                                <span className="text-muted">Published</span>
                                <span className="badge bg-success d-block mt-1">4</span>
                              </label>
                            </div>
                            <div className="room col">
                              <input type="checkbox" id="1B" />
                              <label htmlFor="1B">
                                <i className="icofont-clock-time fs-2" />
                                <span className="text-muted">Evaluation</span>
                                <span className="badge bg-info d-block mt-1">3</span>
                              </label>
                            </div>
                            <div className="room col">
                              <input type="checkbox" id="1C" />
                              <label htmlFor="1C">
                                <i className="icofont-check-circled fs-2" />
                                <span className="text-muted">Awarded</span>
                                <span className="badge bg-success d-block mt-1">2</span>
                              </label>
                            </div>
                            <div className="room col">
                              <input type="checkbox" disabled="" id="1D" />
                              <label htmlFor="1D">
                                <i className="icofont-close-circled fs-2" />
                                <span className="text-muted">Closed</span>
                                <span className="badge bg-secondary d-block mt-1">1</span>
                              </label>
                            </div>
                          
                           
                            <div className="room col">
                              <input type="checkbox" id="2A" />
                              <label htmlFor="2A">
                                <i className="icofont-gavel fs-2" />
                                <span className="text-muted">Bid Opening</span>
                                <span className="badge bg-warning d-block mt-1">2</span>
                              </label>
                            </div>
                            <div className="room col">
                              <input type="checkbox" id="2B" />
                              <label htmlFor="2B">
                                <i className="icofont-money-bag fs-2" />
                                <span className="text-muted">Financial</span>
                                <span className="badge bg-info d-block mt-1">3</span>
                              </label>
                            </div>
                           
                            <div className="room col">
                              <input type="checkbox" id="2D" />
                              <label htmlFor="2D">
                                <i className="icofont-law fs-2" />
                                <span className="text-muted">Contract</span>
                                <span className="badge bg-primary d-block mt-1">3</span>
                              </label>
                            </div>
                            <div className="room col">
                              <input type="checkbox" id="2E" defaultChecked="" />
                              <label htmlFor="2E">
                                <i className="icofont-delivery-time fs-2" />
                                <span className="text-muted">Delivery</span>
                                <span className="badge bg-success d-block mt-1">4</span>
                              </label>
                            </div>
                           
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Upcoming Deadlines Section */}
                <div className="row g-3 mb-3">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
                        <h6 className="mb-0 fw-bold">Upcoming Deadlines</h6>
                        <a href="#" className="text-primary">View All</a>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <div className="d-flex align-items-center p-3 border rounded">
                              <div className="flex-shrink-0">
                                <i className="icofont-clock-time fs-2 text-warning" />
                              </div>
                              <div className="flex-grow-1 ms-3">
                                <h6 className="mb-1">TND/2025/002 Bid Deadline</h6>
                                <p className="mb-0 small text-muted">Mar 25, 2025 - 3 days left</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <div className="d-flex align-items-center p-3 border rounded">
                              <div className="flex-shrink-0">
                                <i className="icofont-clock-time fs-2 text-danger" />
                              </div>
                              <div className="flex-grow-1 ms-3">
                                <h6 className="mb-1">TND/2025/001 Technical Evaluation</h6>
                                <p className="mb-0 small text-muted">Mar 28, 2025 - 6 days left</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <div className="d-flex align-items-center p-3 border rounded">
                              <div className="flex-shrink-0">
                                <i className="icofont-clock-time fs-2 text-success" />
                              </div>
                              <div className="flex-grow-1 ms-3">
                                <h6 className="mb-1">PO/2025/001 Delivery Due</h6>
                                <p className="mb-0 small text-muted">Apr 30, 2025 - 39 days left</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="row g-3 mb-3">
                  <div className="col-xl-8 col-lg-12 flex-column">
                    <div className="card mb-3">
                      <div className="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
                        <h6 className="mb-0 fw-bold">Tenders by Department</h6>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary active">Weekly</button>
                          <button className="btn btn-outline-primary">Monthly</button>
                          <button className="btn btn-outline-primary">Yearly</button>
                        </div>
                      </div>
                      <div className="card-body">
                        <div id="hiringsources" />
                        <div className="mt-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="small">PWD</span>
                            <div className="progress flex-grow-1 mx-3" style={{ height: "8px" }}>
                              <div className="progress-bar bg-primary" style={{ width: "35%" }}></div>
                            </div>
                            <span className="small fw-bold">4 Tenders</span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <span className="small">Health</span>
                            <div className="progress flex-grow-1 mx-3" style={{ height: "8px" }}>
                              <div className="progress-bar bg-success" style={{ width: "25%" }}></div>
                            </div>
                            <span className="small fw-bold">3 Tenders</span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <span className="small">IT</span>
                            <div className="progress flex-grow-1 mx-3" style={{ height: "8px" }}>
                              <div className="progress-bar bg-info" style={{ width: "20%" }}></div>
                            </div>
                            <span className="small fw-bold">2 Tenders</span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <span className="small">Admin</span>
                            <div className="progress flex-grow-1 mx-3" style={{ height: "8px" }}>
                              <div className="progress-bar bg-warning" style={{ width: "20%" }}></div>
                            </div>
                            <span className="small fw-bold">2 Tenders</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="card">
                      <div className="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
                        <h6 className="mb-0 fw-bold">Recent Tender Activities</h6>
                        <div className="dropdown">
                          <a href="#" className="text-muted" data-bs-toggle="dropdown">
                            <i className="icofont-download fs-5" />
                          </a>
                          <ul className="dropdown-menu dropdown-menu-end">
                            <li><a className="dropdown-item" href="#">Export as PDF</a></li>
                            <li><a className="dropdown-item" href="#">Export as Excel</a></li>
                          </ul>
                        </div>
                      </div>
                      <div className="card-body">
                        <table
                          id="myDataTable"
                          className="table table-hover align-middle mb-0"
                          style={{ width: "100%" }}
                        >
                          <thead>
                            <tr>
                              <th>Tender ID</th>
                              <th>Title</th>
                              <th>Published Date</th>
                              <th>Deadline</th>
                              <th>Status</th>
                              <th>Bids</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>TND/2025/001</td>
                              <td>Construction Material Supply</td>
                              <td>Feb 10, 2025</td>
                              <td>Mar 20, 2025</td>
                              <td><span className="badge bg-success">Published</span></td>
                              <td>8</td>
                            </tr>
                            <tr>
                              <td>TND/2025/002</td>
                              <td>Medical Equipment Supply</td>
                              <td>Mar 01, 2025</td>
                              <td>Mar 25, 2025</td>
                              <td><span className="badge bg-info">Evaluation</span></td>
                              <td>5</td>
                            </tr>
                            <tr>
                              <td>TND/2025/003</td>
                              <td>IT Hardware Procurement</td>
                              <td>Mar 05, 2025</td>
                              <td>Mar 30, 2025</td>
                              <td><span className="badge bg-warning">Published</span></td>
                              <td>12</td>
                            </tr>
                            <tr>
                              <td>TND/2025/004</td>
                              <td>Office Furniture Supply</td>
                              <td>Mar 10, 2025</td>
                              <td>Apr 05, 2025</td>
                              <td><span className="badge bg-danger">Draft</span></td>
                              <td>0</td>
                            </tr>
                            <tr>
                              <td>TND/2025/005</td>
                              <td>Laboratory Equipment</td>
                              <td>Feb 25, 2025</td>
                              <td>Mar 28, 2025</td>
                              <td><span className="badge bg-success">Awarded</span></td>
                              <td>6</td>
                            </tr>
                            <tr>
                              <td>TND/2025/006</td>
                              <td>Vehicle Fleet Management</td>
                              <td>Mar 12, 2025</td>
                              <td>Apr 10, 2025</td>
                              <td><span className="badge bg-info">Bid Opening</span></td>
                              <td>4</td>
                            </tr>
                            <tr>
                              <td>TND/2025/007</td>
                              <td>Cleaning Services Contract</td>
                              <td>Feb 28, 2025</td>
                              <td>Mar 22, 2025</td>
                              <td><span className="badge bg-success">Closed</span></td>
                              <td>10</td>
                            </tr>
                            <tr>
                              <td>TND/2025/008</td>
                              <td>Security Services</td>
                              <td>Mar 15, 2025</td>
                              <td>Apr 12, 2025</td>
                              <td><span className="badge bg-warning">Published</span></td>
                              <td>3</td>
                            </tr>
                            <tr>
                              <td>TND/2025/009</td>
                              <td>Medical Consumables</td>
                              <td>Mar 08, 2025</td>
                              <td>Mar 29, 2025</td>
                              <td><span className="badge bg-info">Evaluation</span></td>
                              <td>7</td>
                            </tr>
                            <tr>
                              <td>TND/2025/010</td>
                              <td>Software Development</td>
                              <td>Mar 18, 2025</td>
                              <td>Apr 15, 2025</td>
                              <td><span className="badge bg-danger">Draft</span></td>
                              <td>0</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-xl-4 col-lg-12 flex-column">
                    <div className="card mb-3">
                      <div className="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
                        <h6 className="mb-0 fw-bold">Quick Actions</h6>
                      </div>
                      <div className="card-body">
                        <div className="wrapper">
                          <div className="inner-wrap">
                            <form>
                              <div className="mb-3">
                                <input
                                  type="text"
                                  className="form-control"
                                  id="tender-title"
                                  placeholder="Tender Title"
                                />
                              </div>
                              <div className="mb-3">
                                <select
                                  className="form-select mb-3"
                                  aria-label="Tender Type"
                                >
                                  <option selected="">Select Tender Type</option>
                                  <option value={1}>Open Tender</option>
                                  <option value={2}>Limited Tender</option>
                                  <option value={3}>Global Tender</option>
                                </select>
                              </div>
                              <div className="mb-3">
                                <input
                                  type="date"
                                  className="form-control"
                                  id="bid-deadline"
                                  placeholder="Bid Deadline"
                                />
                              </div>
                              <button
                                type="submit"
                                className="btn btn-primary w-100"
                              >
                                Create New Tender <i className="icofont-plus-circle fs-5" />
                              </button>
                              <hr />
                              <button
                                type="button"
                                className="btn btn-success w-100 mb-2"
                              >
                                <i className="icofont-file-pdf fs-5 me-2" />
                                Generate Report
                              </button>
                              <button
                                type="button"
                                className="btn btn-info w-100"
                              >
                                <i className="icofont-chart-line fs-5 me-2" />
                                View Analytics
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="card mb-3">
                      <div className="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
                        <h6 className="mb-0 fw-bold">Recent Activity Feed</h6>
                      </div>
                      <div className="card-body p-0">
                        <div className="list-group list-group-flush">
                          <div className="list-group-item d-flex align-items-center">
                            <div className="me-3">
                              <i className="icofont-file-alt text-success" />
                            </div>
                            <div className="flex-grow-1">
                              <small className="d-block">New tender published: TND/2025/008</small>
                              <small className="text-muted">2 hours ago</small>
                            </div>
                          </div>
                          <div className="list-group-item d-flex align-items-center">
                            <div className="me-3">
                              <i className="icofont-envelope-open text-info" />
                            </div>
                            <div className="flex-grow-1">
                              <small className="d-block">New bid submitted for TND/2025/003</small>
                              <small className="text-muted">5 hours ago</small>
                            </div>
                          </div>
                          <div className="list-group-item d-flex align-items-center">
                            <div className="me-3">
                              <i className="icofont-check-circled text-warning" />
                            </div>
                            <div className="flex-grow-1">
                              <small className="d-block">MPR/2025/002 approved by Finance</small>
                              <small className="text-muted">Yesterday</small>
                            </div>
                          </div>
                          <div className="list-group-item d-flex align-items-center">
                            <div className="me-3">
                              <i className="icofont-file-invoice text-primary" />
                            </div>
                            <div className="flex-grow-1">
                              <small className="d-block">PO/2025/001 issued to UltraTech</small>
                              <small className="text-muted">Yesterday</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    
                  </div>
                </div>
                {/* .row end */}
              </div>
            </div>



    </>
  );
};

export default Dashboard;