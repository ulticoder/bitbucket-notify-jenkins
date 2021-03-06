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
package com.mastercard.scm.bitbucket.notifyjenkins;

import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import com.atlassian.sal.api.user.UserManager;
import org.springframework.beans.factory.annotation.Autowired;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

/**
 * Exposes HTTP endpoint allowing Javascript clients to post and read plugin settings.
 *
 * Endpoint: https://{your_server}/rest/notify-jenkins/1.0/config
 */
@Path("/config")
public class PluginConfigResource {

    @ComponentImport
    private final UserManager userManager;

    private final PluginConfigService configService;

    @Autowired
    public PluginConfigResource(UserManager userManager, PluginConfigService configService) {
        this.userManager = userManager;
        this.configService = configService;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response get(@Context HttpServletRequest request) {
        String username = userManager.getRemoteUsername(request);

        // authenticated user is required
        if (username != null) {
            return Response.ok(configService.getConfig()).build();
        } else {
            return Response.status(Status.UNAUTHORIZED).build();
        }
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    public Response put(final PluginConfig config, @Context HttpServletRequest request) {
        String username = userManager.getRemoteUsername(request);

        // sys admin required to update settings
        if (username != null && userManager.isSystemAdmin(username)) {
            configService.saveConfig(config);
            return Response.noContent().build();
        } else {
            return Response.status(Status.UNAUTHORIZED).build();
        }
    }
}