# Organization Manager

In the architecture section, we have focused on the global protocol that allows decentralized components to conduct governance processes. However, organizations also need to use internal services before censuses can be exported and processes can be created.

The manager is a private service providing organizations with a UI to manage their community and edit their public content. This involved news feeds, voting processes, assemblies, events, etc.

It also allows to manage the members and their attributes (for example, age or payment status). Such data typically lives on a private database that will compute updated snapshots of the census at a given point in time.

The manager also allows to define the requirements that users have to accomplish for a user to be in a census and export the generated censuses.

<div style="padding: 20px; background-color: white; text-align: center;">
        <img src="https://raw.githubusercontent.com/vocdoni/design/main/docs/manager-overview.png" alt="Manager overview"/>
</div>

The manager is made of three components:

- Centralized Backend
   - [Manager API](/manager/manager-api.md)
   - [Registry API](/manager/registry-api.md)
- Database
- Push Notification service
   - [Push Notifications API](/manager/push-notifications-api.md)


