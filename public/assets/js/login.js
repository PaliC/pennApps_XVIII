$(document).ready(() => {
 $('#provider-login').click(() => {
    location.href = '/login/provider'
  });
  $('#patient-login').click(() => {
    location.href = '/login/patient'
  });
  $('#patient-signup').click(() => {
    location.href= '/signup/patient'
  });
  $('#provider-signup').click(() => {
    location.href = '/signup/provider'
  })
});
