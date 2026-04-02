import React, { useState } from "react";

const Register = ({ goToLogin }) => {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    Code: "",
    Name: "",
    Id: "",
    contactPerson: "",
    mobileNo: "",
    emailId: "",

    addressLine1: "",
    city: "",
    state: "",
    country: "",
    pincode: "",

    gstNo: "",
    panNo: "",
    drugLicenseNo: "",

    bankName: "",
    accountNo: "",
    ifscCode: "",

    isPreferred: "No",
    isBlacklisted: "No",
    remarks: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const next = () => setStep(step + 1);
  const prev = () => setStep(step - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert("Form Submitted ✅");
  };

  return (
    <div className="wrapper register">

      {/* <div className="form-box register-form"> */}
        <h2>Register</h2>

        {/* PROGRESS */}
        <div className="progress-container">

          {["Basic","Address","Legal","Bank","Preference"].map((item, index) => (
            <div
              key={index}
              className={`progress-step ${step > index + 1 ? "completed" : ""}`}
            >
              <div className="circle">
                {step > index + 1 ? "✓" : index + 1}
              </div>
              <p>{item}</p>
            </div>
          ))}

          <div className="progress-line">
            <div
              className="progress-fill"
              style={{ width: `${(step - 1) * 25}%` }}
            ></div>
          </div>

        </div>

        <form onSubmit={handleSubmit}>

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <h3>Basic</h3>
              <div className="input-box"><input name="Code" placeholder="Code" onChange={handleChange} /></div>
              <div className="input-box"><input name="Name" placeholder="Name" onChange={handleChange} /></div>
              <div className="input-box"><input name="Id" placeholder="ID" onChange={handleChange} /></div>
              <div className="input-box"><input name="contactPerson" placeholder="Contact" onChange={handleChange} /></div>
              <div className="input-box"><input name="mobileNo" placeholder="Mobile" onChange={handleChange} /></div>
              <div className="input-box"><input name="emailId" placeholder="Email" onChange={handleChange} /></div>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <h3>Address</h3>
              <div className="input-box"><input name="addressLine1" placeholder="Address" onChange={handleChange} /></div>
              <div className="input-box"><input name="city" placeholder="City" onChange={handleChange} /></div>
              <div className="input-box"><input name="state" placeholder="State" onChange={handleChange} /></div>
              <div className="input-box"><input name="country" placeholder="Country" onChange={handleChange} /></div>
              <div className="input-box"><input name="pincode" placeholder="Pincode" onChange={handleChange} /></div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <h3>Legal</h3>
              <div className="input-box"><input name="gstNo" placeholder="GST" onChange={handleChange} /></div>
              <div className="input-box"><input name="panNo" placeholder="PAN" onChange={handleChange} /></div>
              <div className="input-box"><input name="drugLicenseNo" placeholder="Drug License" onChange={handleChange} /></div>
            </>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <>
              <h3>Bank</h3>
              <div className="input-box"><input name="bankName" placeholder="Bank" onChange={handleChange} /></div>
              <div className="input-box"><input name="accountNo" placeholder="Account" onChange={handleChange} /></div>
              <div className="input-box"><input name="ifscCode" placeholder="IFSC" onChange={handleChange} /></div>
            </>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <>
              <h3>Preference</h3>

              <div className="radio-group">
                <label>
                  <input type="radio" name="isPreferred" value="Yes" onChange={handleChange}/> isPreferred
                </label>
               
              </div>

              <div className="radio-group">
                <label>
                  <input type="radio" name="isBlacklisted" value="Yes" onChange={handleChange}/> isBlacklisted
                </label>
               
              </div>

              <div className="input-box">
                <input name="remarks" placeholder="Remarks" onChange={handleChange} />
              </div>
            </>
          )}

          {/* BUTTONS */}
          <div className="button-group">
            {step > 1 && <button type="button" className="prev-btn" onClick={prev}>Previous</button>}
            {step < 5 && <button type="button" className="next-btn" onClick={next}>Next</button>}

            {step === 5 && (
              <div className="corner-buttons">
                <button type="button" className="cancel-btn">Cancel</button>
                <button type="submit" className="submit-btn">Submit</button>
              </div>
            )}
          </div>

          <p className="login-link">
            Already have account? <span onClick={goToLogin}>Login</span>
          </p>

        </form>
      {/* </div> */}

      <div className="info-content">
        <h2>Welcome Back!</h2>
        <p>Already have an account?</p>
        <button className="btn" onClick={goToLogin}>Login</button>
      </div>

    </div>
  );
};

export default Register;