'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/_components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/_components/ui/avatar";
import { User, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { capitaliseAndSpace, getInitials } from "@/_utils/formatting";

export function UserMenu({ session, LogoutComponent }: { session: any; LogoutComponent?: React.ComponentType }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-cy="dropdown-button">
          <Avatar>
            <AvatarFallback className="bg-ocean-blue text-white">
              { session?.user?.name ? getInitials(session.user.name) : ""}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-3 items-start">
          <p className="font-medium leading-none">
            {session?.user?.name ?? "No name assigned"}
          </p>
          <p className="text-xs leading-none text-muted-foreground">
            { session?.user?.role ? capitaliseAndSpace(session?.user?.role) : "No role assigned" }
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {LogoutComponent ? (
          <DropdownMenuItem>
            <LogoutComponent />
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
