import React from "react";

const WorkOrderView = () => {
  const data = [
    {
      id: 1,
      woNo: "WO-2026-001",
      contractNo: "CNT-4587",
      vendor: "ABC Constructions Pvt Ltd",
      issueDate: "01 Apr 2026",
      deliveryDate: "10 May 2026",
      amount: 50000
    },
    {
      id: 2,
      woNo: "WO-2026-002",
      contractNo: "CNT-4588",
      vendor: "XYZ Infra Solutions",
      issueDate: "05 Apr 2026",
      deliveryDate: "20 May 2026",
      amount: 80000
    },
    {
      id: 3,
      woNo: "WO-2026-003",
      contractNo: "CNT-4589",
      vendor: "BuildCorp Engineers",
      issueDate: "08 Apr 2026",
      deliveryDate: "01 Jun 2026",
      amount: 120000
    },
    {
      id: 4,
      woNo: "WO-2026-004",
      contractNo: "CNT-4590",
      vendor: "MetroWorks Pvt Ltd",
      issueDate: "10 Apr 2026",
      deliveryDate: "15 Jun 2026",
      amount: 95000
    },
    {
      id: 5,
      woNo: "WO-2026-005",
      contractNo: "CNT-4591",
      vendor: "Skyline Infrastructure Ltd",
      issueDate: "12 Apr 2026",
      deliveryDate: "25 Jun 2026",
      amount: 150000
    }
  ];

  const downloadPDF = (woNo) => {
    alert(`Downloading PDF for ${woNo}`);
  };

  const sendEmail = (woNo) => {
    alert(`Email sent for ${woNo}`);
  };

  return (
    <div className="container mt-5">
      <div className="card  p-2">
        <h6 className="text-left mb-3 fw-semibold">Work Order List</h6>
<table className="table table-hover align-middle mb-0 text-nowrap">
              <thead className="table-light">
            <tr>
              <th>Order No</th>
              <th>Contract No</th>
              <th>Vendor Name</th>
              <th>Issue Date</th>
              <th>Delivery Date</th>
              <th>Amount</th>
              <th> PDF</th>
              <th> Email</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{item.woNo}</td>
                <td>{item.contractNo}</td>
                <td>{item.vendor}</td>
                <td>{item.issueDate}</td>
                <td>{item.deliveryDate}</td>
               <td className="fw-bold text-primary">
                    ₹ {item.amount.toLocaleString()}
                  </td>


                <td>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => downloadPDF(item.woNo)}
                  >
                    Download
                  </button>
                </td>

                <td>
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={() => sendEmail(item.woNo)}
                  >
                    Send
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkOrderView;

