/*
 * Copyright (c) 2017 Mastercard Worldwide
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function ($) {
  require(['bitbucket/util/state'], function (state) {
    var pluginConfigUrl = AJS.contextPath() + "/rest/notify-jenkins/1.0/config";
    var repoConfigUrl;

    var pluginConfigData = {
      instances: []
    };

    var repoConfigData = {};

    $(document).ready(function () {
      repoConfigUrl = AJS.contextPath() + "/rest/notify-jenkins/1.0/" + state.getProject().key + "/" + state.getRepository().slug + "/config";

      loadData();

      $("#pluginConfigForm").on('submit', onSubmitForm);
    });

    function onSubmitForm(e) {
      e.preventDefault();
      saveData();
    }

    function loadData() {
      $.when(
        $.get(pluginConfigUrl),
        $.get(repoConfigUrl)
      ).done(function(pluginConfig, repoConfig) {
        console.log('found repoConfigData', repoConfig[0]);
        console.log('found plugin data', pluginConfig[0])
        repoConfigData = repoConfig[0];
        pluginConfigData = pluginConfig[0];
        render();
      });
    }

    function getCloneUrl() {
      return pluginConfigData.repoUrlPattern
        .replace('{{PROJECT_KEY}}', state.getProject().key)
        .replace('{{REPO_SLUG}}', state.getRepository().slug);
    }

    function saveData() {
      repoConfigData.active = $('#active').is(':checked');
      repoConfigData.jenkinsInstance = $('#jenkinsInstance').val();

      if ($("#targetPluginBranchSource").is(':checked')) {
        repoConfigData.jenkinsTargetPlugin = "BRANCH_SOURCE";
      } else {
        repoConfigData.jenkinsTargetPlugin = "GIT";
      }

      $.ajax({
        url: repoConfigUrl,
        type: "PUT",
        dataType: 'json',
        contentType: "application/json",
        data: JSON.stringify(repoConfigData),
        processData: false,
        error: function (res) {
          console.log('error response is ', res)
          AJS.flag({
            close: 'auto',
            type: 'error',
            title: 'Error Updating Settings',
            body: res.responseJSON.join('<br/>')

          });
        },
        success: function () {
          AJS.flag({
            close: 'auto',
            type: 'success',
            title: 'Updated Settings'
          });
          render();
        }
      });
    }

    function render() {
      var isBranchSource = repoConfigData.jenkinsTargetPlugin == "BRANCH_SOURCE";

      $("#targetPluginGit").prop("checked", !isBranchSource);
      $("#targetPluginBranchSource").prop("checked", isBranchSource);
      $('#active').prop('checked', repoConfigData.active);
      $('#cloneUrl').text(getCloneUrl());
      $('#pluginConfigForm').show();

      renderJenkinsInstances();
    }

    function renderJenkinsInstances() {
      var $select = $('#jenkinsInstance');
      $select.find('option').remove()

      pluginConfigData.instances.forEach(function(instance) {
        $select.append(
          $('<option value="' + instance.code + '">' + instance.name + '</option>')
        )
      });

      if (pluginConfigData.instances.length == 1) {
        $select.val($('#jenkinsInstance option:first').val());
      } else {
        $select.val(repoConfigData.jenkinsInstance);
      }
    }

  });
})(AJS.$ || jQuery);


