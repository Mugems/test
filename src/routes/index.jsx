import React from 'react';
import { Navigate } from 'react-router-dom';

// Profile
import Dashboard from 'pages/Dashboard';
// Authentication related pages
import Login from '../pages/Authentication/Login';
import Logout from '../pages/Authentication/Logout';
import ForgetPwd from '../pages/Authentication/ForgetPassword';
import AuthlockScreen from 'pages/Authentication/Auth-lock-screen';
//organization
// import Organization from '../pages/Organization/org-settings';
// import OrgView from 'pages/Organization/org-view';
// import AddBranch from '../../src/pages/Organization/Branch/AddBranch';
// import ListBranch from '../../src/pages/Organization/Branch/ListBranch';
// import ViewBranch from '../../src/pages/Organization/Branch/ViewBranch';
// import AddLine from '../../src/pages/Organization/Line/AddLine';
// import ViewLine from '../../src/pages/Organization/Line/ViewLine';
// import AddArea from '../../src/pages/Organization/Area/AddArea';
// import ViewArea from '../../src/pages/Organization/Area/ViewArea';
// import AddExpense from '../pages/Organization/ExpenseType/AddExpense';
// import ExpenseTypeList from '../pages/Organization/ExpenseType/ExpenseTypeList';
// import AddInvestment from 'pages/Organization/Investments/AddInvestment';
// import ExpenseTransactionList from 'pages/Organization/ExpenseTransaction/ExpenseTransactionList';
// import ExpenseTransactionForm from 'pages/Organization/ExpenseTransaction/ExpenseTransactionForm';
// import DisburseLoanForm from 'pages/Organization/DisburseLoan/DisburseLoanForm';
// import DisburseLoanList from 'pages/Organization/DisburseLoan/DisburseLoanList';
// import Location from 'pages/Organization/Location/Location'

// //User Module

// import AddUser from 'pages/Users/AddUser';
// import ListUser from 'pages/Users/ListUser';
// import Viewuser from 'pages/Users/ViewUser';
// import InvestmentList from 'pages/Organization/Investments/InvestmentList';

// //Reset module 
// import ResetPassword from '../pages/ResetPassword/ResetPassword';
import AddCustomer from 'pages/Organization/Customer/AddCustomer';
import ViewCustomer from 'pages/Organization/Customer/ViewCustomer';

const authProtectedRoutes = [
  { path: '/home', component: <Dashboard /> },
  {
    path: '/',
    exact: true,
    component: <Navigate to="/branch/list" />,
  },

  // { path: '/settings', component: <Organization /> },
  // { path: '/view', component: <OrgView /> },
  // { path: '/branch/add', component: <AddBranch /> },
  // { path: '/branch/list', component: <ListBranch /> },
  // { path: '/branch/view/:id', component: <ViewBranch /> },
  // { path: '/branch/edit/:id', component: <AddBranch /> },
  // { path: '/line/add', component: <AddLine /> },
  // { path: '/line/edit/:id', component: <AddLine /> },
  // { path: '/line', component: <ViewLine /> },

  // { path: '/expense/add', component: <AddExpense /> },
  // { path: '/expense/list', component: <ExpenseTypeList /> },
  // { path: '/expense/edit/:id', component: <AddExpense /> },

  // { path: '/area/add', component: <AddArea /> },
  // { path: '/area/edit/:id', component: <AddArea /> },
  // { path: '/area', component: <ViewArea /> },
  // { path: '/expense/add', component: <AddExpense /> },
  // { path: '/expense/list', component: <ExpenseTypeList /> },
  // { path: '/user/list', component: <ListUser /> },
  // { path: '/user/add', component: <AddUser /> },
  // { path: '/user/edit/:id', component: <AddUser /> },
  // { path: 'user/view/:id', component: <Viewuser /> },

  // { path: '/investment', component: <InvestmentList /> },
  // { path: '/investment/add', component: <AddInvestment /> },
  // { path: '/investment/edit/:id', component: <AddInvestment /> },

  // { path: '/expense-transaction', component: <ExpenseTransactionList /> },
  // { path: '/expense-transaction/add', component: <ExpenseTransactionForm /> },
  // { path: '/expense-transaction/edit/:id', component: <ExpenseTransactionForm /> },

  // { path: '/disburse-loan', component: <DisburseLoanList /> },
  // { path: '/new-loan-disbursement', component: <DisburseLoanForm /> },
  // { path: '/new-loan-disbursement/:id', component: <DisburseLoanForm /> },
  // {path: '/location-list',component: <Location/>},
  // {path:"/reset-password", component: <ResetPassword /> },
  {path:"/add-customer", component: <AddCustomer /> },
  {path:"/customer/edit/:id", component: <AddCustomer /> },
  {path:"/view-customer", component: <ViewCustomer /> },
];

const publicRoutes = [
  { path: '/logout', component: <Logout /> },
  { path: '/login', component: <Login /> },
  { path: '/forgot-password', component: <ForgetPwd /> },
  { path: '/lock-screen', component: <AuthlockScreen /> },
];

export { authProtectedRoutes, publicRoutes };