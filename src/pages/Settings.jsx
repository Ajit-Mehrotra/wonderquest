import React from "react";

import "../styles/Settings.css";

import WeightSettings from "../components/settings/WeightSettings";
import ProfileSettings from "../components/settings/ProfileSettings";
import AccountManagement from "../components/settings/AccountManagement";
import { Tab, Tabs } from "react-bootstrap";

const Settings = () => {
  return (
    <div className="mt-4 container text-center">
      <h1>Settings</h1>

      <Tabs
        defaultActiveKey="weights"
        id="uncontrolled-tab-example"
        className="my-3"
        variant="tabs"
        fill
      >
        <Tab eventKey="weights" title="Weight Settings">
          <WeightSettings />
        </Tab>
        <Tab eventKey="profile-settings" title="Profile Settings">
          <ProfileSettings />
        </Tab>
        <Tab eventKey="account-management" title="Account Mangement">
          <AccountManagement />
        </Tab>
      </Tabs>
    </div>
  );
};

export default Settings;
