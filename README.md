# ft_transcendence
Final project of the Codam Core.<br>

ft_transcendence is a website where users can play games such as pong with other players, as well as features such as JWT/2FA authentication, a chat, private messages, friends list, profiles, a match-making system, and a spectating system.

ft_transcendence uses the following technologies:

 - React
 - NestJS
 - PostgreSQL
 
 For a working example please visit [ft_transcendence](http://rowankieboom.nl:3006). And choose to login with either google or 42.
 
 If you have found any issues please let me or @rkieboom know.

## API
Before starting this project we sketched out a mindmap for figuring out the endpoints for the backend API

<img width="400" alt="2469a2c39d69c73b860c39f78da6c96f" src="https://user-images.githubusercontent.com/60445103/212190583-9554876b-2985-4dfe-8c98-d1889ac0e558.jpg">

After that we worked on doing the actual API which eventually looked like this. Which we made using Swagger (openAPI 3.0)

<img width="400" alt="screencapture-rowankieboom-nl-3000-2023-01-12-23_12_15" src="https://user-images.githubusercontent.com/60445103/212192243-eb50c4b2-2c2f-4869-993b-04963aac2e82.png">

# Pages

## Additional info page
<img width="800" alt="17ce218c4f903b6d4a3ba7866a1fe476" src="https://user-images.githubusercontent.com/60445103/212181637-9fe28410-93dd-49bf-864f-e3ff1ba2fd70.png">


## Homepage
<img width="800" alt="6e8a4d2e5431783cc2c28dc58ff5624a" src="https://user-images.githubusercontent.com/60445103/212181851-3f0c5817-2570-4f88-8b6e-36624a38648d.png">


## Game
<img width="800" alt="screencapture-rowankieboom-nl-3006-pong-2023-01-13-12_39_09" src="https://user-images.githubusercontent.com/60445103/212312115-10f96547-a063-429c-a576-95f33ab5e65e.png">

<img width="800" alt="screencapture-rowankieboom-nl-3006-pong-2023-01-13-12_39_24" src="https://user-images.githubusercontent.com/60445103/212312102-d0a98cac-f6ea-420f-a951-3be6b4d94626.png">

<img width="800" alt="screencapture-rowankieboom-nl-3006-pong-2023-01-13-12_39_18" src="https://user-images.githubusercontent.com/60445103/212312109-a93a1b1a-2573-4d77-933a-612485cb3fb2.png">


## Chat
<img width="800" alt="screencapture-rowankieboom-nl-3006-chat-2023-01-13-12_35_23" src="https://user-images.githubusercontent.com/60445103/212311506-5d02f67e-7e8d-4673-801f-eac946debe02.png">

<img width="800" alt="screencapture-rowankieboom-nl-3006-chat-2023-01-13-12_36_22" src="https://user-images.githubusercontent.com/60445103/212311499-31208b20-e541-4ee4-9187-064253649deb.png">

<img width="800" alt="screencapture-rowankieboom-nl-3006-chat-2023-01-13-12_35_48" src="https://user-images.githubusercontent.com/60445103/212311503-065a3a9b-093d-49bd-a376-52964bc12ad5.png">


## Friends
<img width="800" alt="screencapture-rowankieboom-nl-3006-friends-2023-01-13-12_31_14" src="https://user-images.githubusercontent.com/60445103/212310686-2cb62b83-567e-4685-be9b-aa48a48dc93e.png">


## Social
<img width="800" alt="screencapture-rowankieboom-nl-3006-social-2023-01-13-12_29_50" src="https://user-images.githubusercontent.com/60445103/212310529-f0965e06-081e-4fa1-8d73-d0630332477a.png">


## Profile
<img width="800" alt="screencapture-rowankieboom-nl-3006-profile-2023-01-13-12_32_46" src="https://user-images.githubusercontent.com/60445103/212310928-14c82a65-facb-4e2e-a808-f03672fbb57f.png">


## Settings
<img width="800" alt="ceb20bcc0136ae76e49e9de7fac0b2a9" src="https://user-images.githubusercontent.com/60445103/212181998-7045c96a-bf56-41c6-8381-b6307074fe9c.jpg">


## Resources
Here are some of the resources we have used.

 - https://dev.to/novu/building-a-chat-app-with-socketio-and-react-2edj
 - https://www.mindmeister.com/map/2462871372
 - https://arctype.com/blog/nestjs-2fa/
 - https://github.com/typeorm/typeorm/blob/master/docs/listeners-and-subscribers.md#beforeupdate
 - https://orkhan.gitbook.io/typeorm/docs/find-options
 - https://www.youtube.com/watch?v=LlvBzyy-558&list=LL&index=1
 - https://github.com/axios/axios#request-config
 - https://stackoverflow.com/questions/58579426/in-useeffect-whats-the-difference-between-providing-no-dependency-array-and-an
